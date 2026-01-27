import express from "express";
import {
    requestOtp,
    verifyOtp,
    updateCart,
    clearCart,
    getProfile,
    updateProfile,
    getAllAppUsers,
    getAppUserById,
    adminUpdateAppUser,
    getAppUserHistory,
    updateLeadTracking,
} from "../controllers/appUser.controller.js";
import { authenticateAppUser, authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Auth routes
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", requestOtp);

// Profile & Cart routes (Protected) - MOVE THESE UP
router.get("/profile", authenticateAppUser, getProfile);
router.patch("/profile", authenticateAppUser, updateProfile);
router.patch("/cart", authenticateAppUser, updateCart);
router.delete("/cart", authenticateAppUser, clearCart);

// Dashboard routes (Admin)
router.get("/", authenticateAdmin, getAllAppUsers);
router.get("/:id", authenticateAdmin, getAppUserById);
router.patch("/:id", authenticateAdmin, adminUpdateAppUser);
router.get("/:id/history", authenticateAdmin, getAppUserHistory);
router.patch("/:id/lead-tracking", authenticateAdmin, updateLeadTracking);

export default router;
