import express from "express";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
 
router.get("/about", protect, (req, res) => res.render("pages/about"));
router.get("/contact", protect, (req, res) => res.render("pages/contact"));
 
export default router;