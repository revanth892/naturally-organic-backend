import express from "express";
import { generatePresignedUrl } from "../controllers/media.controller.js";
import { authenticateAdmin, authenticateAppUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Allow app users to get presigned URLs for profile images
router.get("/app-presigned-url", authenticateAppUser, generatePresignedUrl);

// Keep existing admin route for CMS
router.get("/presigned-url", authenticateAdmin, generatePresignedUrl);

export default router;
