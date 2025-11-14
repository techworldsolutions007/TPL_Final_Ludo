import GameHistory from "../model/GameHistory.js";

// ✅ Create a new game history
export const createGameHistory = async (req, res) => {
  try {
    const game = await GameHistory.create(req.body);
    res.status(201).json({ success: true, message: "Game history created", game });
  } catch (error) {
    console.error("Error creating game history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get all game histories (paginated)
export const getAllGameHistories = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const histories = await GameHistory.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await GameHistory.countDocuments();
    res.json({ success: true, total, histories });
  } catch (error) {
    console.error("Error fetching game histories:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get a specific match by ID
export const getGameHistoryById = async (req, res) => {
  try {
    const game = await GameHistory.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Update a game record
export const updateGameHistory = async (req, res) => {
  try {
    const game = await GameHistory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!game) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Game history updated", game });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Delete a game record
export const deleteGameHistory = async (req, res) => {
  try {
    const deleted = await GameHistory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Game history deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get user’s game history
export const getUserGameHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const games = await GameHistory.find({ "players.userId": userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: games.length, games });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
