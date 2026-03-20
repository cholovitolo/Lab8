import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
router.get("/register", (req, res) => res.render("register"));
router.post("/register", register);
 
router.get("/login", (req, res) => res.render("login"));
router.post("/login", login);
 
router.get("/logout", protect, logout);
 
export default router;