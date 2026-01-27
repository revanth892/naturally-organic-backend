import express from "express";
import {
    createCoupon,
    getAllCoupons,
    getOneCoupon,
    updateCoupon,
    deleteCoupon,
    validateCouponCode
} from "../controllers/coupon.controller.js";

import { authenticateAdmin } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/", authenticateAdmin, createCoupon); // Auto-generates code if "code" field is missing
router.get("/", authenticateAdmin, getAllCoupons);
router.post("/validate", validateCouponCode); // Public/Client checking
router.get("/:id", authenticateAdmin, getOneCoupon);
router.patch("/:id", authenticateAdmin, updateCoupon);
router.delete("/:id", authenticateAdmin, deleteCoupon);

export default router;
