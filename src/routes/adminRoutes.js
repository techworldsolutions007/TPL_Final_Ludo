import express from "express";
import { getAdminById, getCurrentAdmin } from "../controllers/adminController";

const router = express.Router();

// Public or protected route
router.get("/:id", async (req, res) => {
  try {
    const admin = await AdminProfile.findById(req.params.id).select("-password");
    if (!admin) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Optional token-based route
router.get("/me", getCurrentAdmin);

export default router;
