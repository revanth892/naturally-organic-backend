import express from "express";
import {
    createSubcategory,
    getAllSubcategories,
    getOneSubcategory,
    updateSubcategory,
    deleteSubcategory,
    updateSubcategorySortOrder,
} from "../controllers/subcategory.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllSubcategories);
router.get("/:id", getOneSubcategory);

// Protected routes
router.use(protect);
router.use(authorize("productAccess"));

router.post("/", createSubcategory);
router.patch("/sort-order/update", updateSubcategorySortOrder);
router.patch("/:id", updateSubcategory);
router.delete("/:id", deleteSubcategory);

export default router;
