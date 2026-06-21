import express from "express";
import {loginAdmin} from "../controller/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Admin profile access granted",
    user: req.user,
  });
});


export default router;