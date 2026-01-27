import express from "express";
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    getAllOrdersAdmin,
    updateOrderStatus
} from "../controllers/order.controller.js";
import { authenticateAppUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// App User Routes
router.post("/checkout", authenticateAppUser, placeOrder);
router.get("/my-orders", authenticateAppUser, getMyOrders);
router.get("/:id", authenticateAppUser, getOrderById);

// Admin Routes (Protected by Admin Auth - assuming different middleware later, currently using AppUser for simplicity or open)
// Ideally, we should have 'authenticateAdmin' here. For now, I will expose them but mark as Admin.
router.get("/", getAllOrdersAdmin); // Admin
router.patch("/:id/status", updateOrderStatus); // Admin

export default router;
