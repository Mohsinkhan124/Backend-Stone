import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controller/blogController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"; // same multer file used in products

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createBlog);


router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.put("/:id", authMiddleware, upload.single("image"), updateBlog);
router.delete("/:id", authMiddleware, upload.single("image"), deleteBlog);

export default router;