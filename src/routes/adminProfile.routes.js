import express from "express";
import {
  changeAdminPassword,
  getAdminProfile,
  getAllAdminProfiles,
  updateAdminProfile,
} from "../controllers/admin/adminProfile.controller.js";

const router = express.Router();

// ✅ Fetch admin profile
router.get("/", getAdminProfile);

// ✅ Update admin profile
router.put("/", updateAdminProfile);
router.put("/change-password", changeAdminPassword);
router.get("/all", getAllAdminProfiles); // 👈 new route for Manage Users

export default router;
