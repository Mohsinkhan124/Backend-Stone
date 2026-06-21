import express from "express";
import { createTestimonial, getAllTestimonials, getTestimonialById, updateTestimonial, deleteTestimonial } from "../controller/testimonialController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createTestimonial);
router.get("/", getAllTestimonials);
router.get("/:id", getTestimonialById);
router.put("/:id", authMiddleware, updateTestimonial);
router.delete("/:id", authMiddleware, deleteTestimonial);

export default router;