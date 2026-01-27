import express from "express";
import {
    createUser,
    loginUser,
    getAllUsers,
    getUserById,
    updatePermissions,
    resetPassword,
    toggleUserStatus,
} from "../controllers/user.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/login", loginUser);
router.post("/", createUser); // Public for bootstrapping first admin

// Protected (requires Admin Token)
router.get("/", authenticateAdmin, getAllUsers);
router.get("/:id", authenticateAdmin, getUserById);
router.patch("/:id/permissions", authenticateAdmin, updatePermissions);
router.patch("/:id/toggle-status", authenticateAdmin, toggleUserStatus);
router.patch("/:id/reset-password", authenticateAdmin, resetPassword);

export default router;
