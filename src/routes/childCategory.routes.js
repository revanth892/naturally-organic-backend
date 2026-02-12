import express from "express";
import {
    createChildCategory,
    getAllChildCategories,
    getOneChildCategory,
    updateChildCategory,
    deleteChildCategory,
    updateChildCategorySortOrder
} from "../controllers/childCategory.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (if any needed, keeping them protected for now as they are for dashboard)
router.get("/", getAllChildCategories);
router.get("/:id", getOneChildCategory);

// Protected dashboard routes
router.use(protect);
router.use(authorize("productAccess"));

router.post("/", createChildCategory);
router.put("/sort-order", updateChildCategorySortOrder);
router.put("/:id", updateChildCategory);
router.delete("/:id", deleteChildCategory);

export default router;
