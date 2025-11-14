import User from "../../model/user.js";
import History from "../../model/history.js";
import Profile from "../../model/Profile.js";

// ✅ Get All Players
export const getAllPlayers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25; // ✅ Default to 25 per page
    const skip = (page - 1) * limit;

    const [players, total] = await Promise.all([
      Profile.find({ role: "user" })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Profile.countDocuments({ role: "user" }),
    ]);

    const playersWithHistory = await Promise.all(
      players.map(async (player) => {
        const history = await History.find({ playerid: player._id })
          .sort({ createdAt: -1 })
          .limit(5);

        return {
          ...player.toObject(),
          fullName: `${player.first_name || ""} ${
            player.last_name || ""
          }`.trim(),
          history,
        };
      })
    );

    res.json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalPlayers: total,
      players: playersWithHistory,
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// player by id
export const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const player = await Profile.findById(id);
    if (!player)
      return res
        .status(404)
        .json({ success: false, error: "Player not found" });

    const history = await History.find({ playerid: id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      player: {
        ...player.toObject(),
        fullName: `${player.first_name || ""} ${player.last_name || ""}`.trim(),
        history,
      },
    });
  } catch (error) {
    console.error("Error fetching player:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};



// ✅ Get all referral details at once
export const getReferralDetails = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of referral IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No referral IDs provided" });
    }

    const referrals = await Profile.find(
      { _id: { $in: ids } },
      { first_name: 1, last_name: 1, createdAt: 1 } // only select required fields
    );

    const formatted = referrals.map((r) => ({
      id: r._id,
      fullName: `${r.first_name || ""} ${r.last_name || ""}`.trim(),
      date: new Date(r.createdAt).toLocaleDateString("en-GB"),
    }));

    return res.json({ success: true, referrals: formatted });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




// ✅ Add Coins
export const addCoins = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Amount must be greater than 0" });

    const player = await Profile.findById(id);
    if (!player) return res.status(404).json({ error: "Player not found" });

    player.wallet += amount;
    await player.save();

    res.json({
      success: true,
      message: `${amount} coins added successfully`,
      balance: player.wallet,
    });
  } catch (error) {
    console.error("Error adding coins:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Deduct Coins
export const deductCoins = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Amount must be greater than 0" });

    const player = await Profile.findById(id);
    if (!player) return res.status(404).json({ error: "Player not found" });

    if (player.wallet < amount)
      return res.status(400).json({ error: "Insufficient balance" });

    player.wallet -= amount;
    await player.save();

    res.json({
      success: true,
      message: `${amount} coins deducted successfully`,
      balance: player.wallet,
    });
  } catch (error) {
    console.error("Error deducting coins:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Delete Player
export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const player = await User.findByIdAndDelete(id);
    if (!player) return res.status(404).json({ error: "Player not found" });

    res.json({
      success: true,
      message: "Player profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
