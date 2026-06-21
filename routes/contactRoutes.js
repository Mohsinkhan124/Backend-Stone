import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
} from "../controller/contactController.js";

const router = express.Router();

// Public
router.post("/", createContact);

// Admin
router.get("/", getAllContacts);
router.get("/:id", getContactById);
router.delete("/:id", deleteContact);

export default router;