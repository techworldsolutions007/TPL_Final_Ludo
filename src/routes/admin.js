import express from "express";
import {
  getActiveUsersLast7Days,
  getDashboardData,
} from "../controllers/admin/main-dashboard.js";
import {
  getAllAdmins,
  getLeaderboard,
} from "../controllers/admin/leaderboard.js";
import { login, register } from "../controllers/admin/auth.js";
import {
  addCoins,
  deductCoins,
  deletePlayer,
  getAllPlayers,
  getPlayerById,
  getReferralDetails,
} from "../controllers/admin/players.js";
import { isAdmin, isAuthenticated } from "../middleware/auth.js";
import {
  getBotSettings,
  getBotStatus,
  resetSettings,
  setBotSettings,
} from "../controllers/admin/botControl.js";
import {
  forgotPassword,
  resetPasswordWithOtp,
} from "../controllers/admin/forgot-password.js";

const router = express.Router();
// 


/* ------------------------- Admin Dashboard & Data ------------------------- */
router.get("/dashboard", getDashboardData);

/* ----------------------------- Leaderboard ----------------------------- */
router.get("/leaderboard", getLeaderboard);
router.get("/active-users", getActiveUsersLast7Days);

/* --------------------------- Auth Management --------------------------- */
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/create-password", resetPasswordWithOtp);

/* ------------------------------ Players API ----------------------------- */
// Fetch all players (open to admin panel to load list)
router.get("/all-players", getAllPlayers);
router.get("/player/:id", getPlayerById);
router.post("/referrals/details", getReferralDetails);

// Add / Deduct coins for a player
router.post("/add-coins/:id", addCoins);
router.post("/deduct-coins/:id", deductCoins);

// Delete player profile
router.delete("/delete-player/:id", isAuthenticated, isAdmin, deletePlayer);

/* ------------------------------ Admins API ------------------------------ */
router.get("/all-admins", isAuthenticated, isAdmin, getAllAdmins);

/* ------------------------------ BOT Control ----------------------------- */
router.get("/bot-settings", isAuthenticated, isAdmin, getBotSettings);
router.put("/set-bot-settings", isAuthenticated, isAdmin, setBotSettings);
router.put("/reset-bot-settings", isAuthenticated, isAdmin, resetSettings);
router.get("/bot-status", isAuthenticated, isAdmin, getBotStatus);

export default router;
