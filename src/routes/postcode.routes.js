import express from "express";
import * as postcodeController from "../controllers/postcode.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("postcodeAccess"), postcodeController.getPostcodes);
router.post("/", protect, authorize("postcodeAccess"), postcodeController.createPostcode);
router.put("/:id", protect, authorize("postcodeAccess"), postcodeController.updatePostcode);
router.delete("/:id", protect, authorize("postcodeAccess"), postcodeController.deletePostcode);

export default router;
