import AdminProfile from "../../model/AdminProfile.js";
import bcrypt from "bcrypt";

/* -------------------- GET ADMIN -------------------- */
export const getAdminProfile = async (req, res) => {
  try {
    const profile = await AdminProfile.findOne({ role: "admin" });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Admin profile not found" });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* -------------------- UPDATE ADMIN -------------------- */
export const updateAdminProfile = async (req, res) => {
  try {
    const updates = req.body;
    const profile = await AdminProfile.findOneAndUpdate(
      { role: "admin" },
      updates,
      { new: true }
    );

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Admin profile not found" });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await AdminProfile.findOne({ role: "admin" });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};



// ================================= */
export const getAllAdminProfiles = async (req, res) => {
  try {
    const admins = await AdminProfile.find({ role: "admin" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: admins });
  } catch (err) {
    console.error("Error fetching admin profiles:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};