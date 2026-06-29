import express from "express";
import { createInquiry, getAllInquiries, getInquiryById, updateInquiryStatus, deleteInquiry, getUnreadInquiryCount, markAllInquiryRead } from "../controller/inquiryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createInquiry);

// admin protected
router.get("/", authMiddleware, getAllInquiries);
router.get("/:id", authMiddleware, getInquiryById);
router.put("/:id", authMiddleware, updateInquiryStatus);
router.delete("/:id", authMiddleware, deleteInquiry);
router.get("/unread-count", authMiddleware, getUnreadInquiryCount);
router.patch("/mark-all-read", authMiddleware, markAllInquiryRead);

export default router;