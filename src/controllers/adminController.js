import AdminProfile from "../model/AdminProfile";

// GET /api/admin/:id
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminProfile.findById(id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Optional — GET /api/admin/me (if using auth tokens)
export const getCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.user?.id; // if decoded from token
    const admin = await AdminProfile.findById(adminId).select("-password");
    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch admin" });
  }
};


