import express from "express";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controller/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", authMiddleware, upload.single("image"), createProduct);
router.put("/:id", authMiddleware, upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, upload.single("image"), deleteProduct);

export default router;