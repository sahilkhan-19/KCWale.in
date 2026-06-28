import express from "express";
import { signup, login, getProfile, updateProfile, sendOtp, googleAuth, changePassword } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/google-auth", googleAuth);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;