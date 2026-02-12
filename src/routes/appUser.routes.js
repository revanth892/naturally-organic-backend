import express from "express";
import {
    register,
    login,
    updateCart,
    clearCart,
    getProfile,
    updateProfile,
    getAllAppUsers,
    getAppUserById,
    adminUpdateAppUser,
} from "../controllers/appUser.controller.js";
import { authenticateAppUser, authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Profile & Cart routes (Protected)
router.get("/profile", authenticateAppUser, getProfile);
router.patch("/profile", authenticateAppUser, updateProfile);
router.patch("/cart", authenticateAppUser, updateCart);
router.delete("/cart", authenticateAppUser, clearCart);

// Dashboard routes (Admin)
router.get("/", authenticateAdmin, getAllAppUsers);
router.get("/:id", authenticateAdmin, getAppUserById);
router.patch("/:id", authenticateAdmin, adminUpdateAppUser);

export default router;
