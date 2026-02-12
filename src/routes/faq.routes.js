import express from "express";
import * as faqController from "../controllers/faq.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("faqAccess"), faqController.getFAQs);
router.post("/", protect, authorize("faqAccess"), faqController.createFAQ);
router.put("/:id", protect, authorize("faqAccess"), faqController.updateFAQ);
router.delete("/:id", protect, authorize("faqAccess"), faqController.deleteFAQ);

export default router;
