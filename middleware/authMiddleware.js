import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // No token → redirect safely
    if (!token) return res.redirect("/login");

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Try refresh token
      if (!refreshToken) return res.redirect("/login");

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        return res.redirect("/login");
      }

      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      // 🔥 FIX HERE
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: isProduction, // ✅ FIXED
        sameSite: "Strict",
      });

      req.user = { id: user._id };
      next();
    }
  } catch (err) {
    console.error("Protect error:", err.message);
    return res.redirect("/login");
  }
};