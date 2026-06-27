import express from "express";
import { createGallery, getAllGallery, getGalleryById, updateGallery, deleteGallery } from "../controller/galleryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"; 

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createGallery);
router.get("/", getAllGallery);
router.get("/:id", getGalleryById);
router.put("/:id", authMiddleware, upload.single("image"), updateGallery);
router.delete("/:id", authMiddleware, upload.single("image"), deleteGallery);

export default router;