import express from "express";
import * as storeController from "../controllers/store.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Routes
router.get("/", protect, authorize("storeAccess"), storeController.getStore);
router.post("/", protect, authorize("storeAccess"), storeController.createStore);
router.put("/:id", protect, authorize("storeAccess"), storeController.updateStore);
router.delete("/:id", protect, authorize("storeAccess"), storeController.deleteStore);

export default router;
