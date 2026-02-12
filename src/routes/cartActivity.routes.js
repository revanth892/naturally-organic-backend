import express from "express";
import { getCartActivity, getAllCartActivities } from "../controllers/cartActivity.controller.js";
import { authenticateAppUser, authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// User routes
router.get("/my-timeline", authenticateAppUser, getCartActivity);

// Admin routes
router.get("/all", authenticateAdmin, getAllCartActivities);

export default router;
