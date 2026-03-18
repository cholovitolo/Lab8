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

  // ✅ Flash message added
  req.flash("success", "Registration successful! Please login.");
  res.redirect("/login");
};

// ✅ LOGIN
export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // ❌ moved flash BEFORE return
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/login");
  }

  const valid = await bcrypt.compare(req.body.password, user.password);

  if (!valid) {
    req.flash("error", "Invalid password");
    return res.redirect("/login");
  }

  // ✅ success message
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

  // ⚠️ FIX: secure must be FALSE for localhost
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
  });

  res.redirect("/dashboard");
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  const user = await User.findById(req.user?.id);

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  req.flash("success", "Logged out successfully");
  res.redirect("/login");
};