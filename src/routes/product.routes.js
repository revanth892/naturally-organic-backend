import express from "express";
import {
    createProduct,
    getAllProducts,
    getOneProduct,
    updateProduct,
    softDeleteProduct,
    toggleImageActive,
    addVariant,
    updateVariant,
    deleteVariant,
    getProductsForUser,
    getOneProductForUser,
} from "../controllers/product.controller.js";
import { authenticateAppUser, authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateAdmin, createProduct);
router.get("/", getAllProducts);
router.get("/app/user", authenticateAppUser, getProductsForUser); // Authenticated Fetch
router.get("/:id", getOneProduct);
router.get("/:id/app/user", authenticateAppUser, getOneProductForUser); // Authenticated Fetch
router.patch("/:id", authenticateAdmin, updateProduct);
router.patch("/:id/soft-delete", authenticateAdmin, softDeleteProduct);

router.patch("/:productId/images/:imageKey/toggle", authenticateAdmin, toggleImageActive);

router.post("/:productId/variants", authenticateAdmin, addVariant);
router.patch("/:productId/variants/:variantId", authenticateAdmin, updateVariant);
router.delete("/:productId/variants/:variantId", authenticateAdmin, deleteVariant);

export default router;
