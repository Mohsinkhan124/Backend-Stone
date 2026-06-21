import express from "express";
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from "../controller/categoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post("/", authMiddleware, createCategory);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);

export default router;