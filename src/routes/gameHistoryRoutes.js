import express from "express";
import {
  createGameHistory,
  getAllGameHistories,
  getGameHistoryById,
  updateGameHistory,
  deleteGameHistory,
  getUserGameHistory,
} from "../controllers/gameHistoryController.js";

const router = express.Router();

router.post("/", createGameHistory);            // Create
router.get("/", getAllGameHistories);           // List all
router.get("/:id", getGameHistoryById);         // Fetch one
router.put("/:id", updateGameHistory);          // Update
router.delete("/:id", deleteGameHistory);       // Delete
router.get("/user/:userId", getUserGameHistory); // User-specific

export default router;
