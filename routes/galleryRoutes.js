import express from "express";
import { createGallery, getAllGallery, getGalleryById, updateGallery, deleteGallery } from "../controller/galleryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createGallery);
router.get("/", getAllGallery);
router.get("/:id", getGalleryById);
router.put("/:id", authMiddleware, updateGallery);
router.delete("/:id", authMiddleware, deleteGallery);

export default router;