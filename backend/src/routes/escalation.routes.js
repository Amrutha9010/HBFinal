import express from "express";
import {
  createEscalation,
  getAllEscalations,
  updateEscalationStatus
} from "../controllers/escalation.controller.js";

import upload from "../middleware/uploadImage.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// 🔹 Student submits escalation
router.post("/", protect, upload.single("attachment"), createEscalation);

// 🔹 Higher authority views all
router.get("/", protect, restrictTo("admin"), getAllEscalations);

// 🔹 Mark as reviewed
router.put("/:id", protect, restrictTo("admin"), updateEscalationStatus);

export default router;