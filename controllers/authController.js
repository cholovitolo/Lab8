import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ REGISTER
export const register = async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);

  await User.create({
    username: req.body.username,
    email: req.body.email,
    password: hashed,
  });

  req.flash("success", "Registration successful! Please login.");
  res.redirect("/login");
};

// ✅ LOGIN
export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/login");
  }

  const valid = await bcrypt.compare(req.body.password, user.password);

  if (!valid) {
    req.flash("error", "Invalid password");
    return res.redirect("/login");
  }

  req.flash("success", "Login successful!");

  const accessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  user.refreshToken = refreshToken;
  await user.save();

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Strict",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Strict",
  });

  res.redirect("/dashboard");
};

// ✅ LOGOUT (FIXED)
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });

      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    // 🔥 CLEAR COOKIES PROPERLY
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    req.flash("success", "Logged out successfully");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};