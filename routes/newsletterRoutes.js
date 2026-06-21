import express from "express";
import {
  subscribeNewsletter,
  getSubscribers,
  deleteSubscriber,
} from "../controller/newsletterController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public (frontend user)
router.post("/", subscribeNewsletter);

// Admin only
router.get("/", authMiddleware, getSubscribers);
router.delete("/:id", authMiddleware, deleteSubscriber);

export default router;