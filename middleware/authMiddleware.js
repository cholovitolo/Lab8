import jwt from "jsonwebtoken";
import User from "../models/User.js";
 
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
 
    if (!token) return res.redirect("/login");
 
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
      return next();
    } catch {
      if (!refreshToken) return res.redirect("/login");
 
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken)
        return res.redirect("/login");
 
      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" },
      );
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
      req.user = { id: user._id };
      next();
    }
  } catch {
    res.redirect("/login");
  }
};