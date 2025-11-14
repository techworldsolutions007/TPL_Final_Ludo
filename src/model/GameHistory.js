import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema(
  {
    matchId: { type: String, required: true, unique: true },
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
        username: String,
        avatar: String,
        coinsBefore: Number,
        coinsAfter: Number,
        result: { type: String, enum: ["win", "lose", "draw"], required: true },
      },
    ],
    winner: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
      username: String,
    },
    totalBet: { type: Number, default: 0 },
    gameMode: { type: String, enum: ["1v1", "4player", "custom"], default: "1v1" },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    duration: { type: Number }, // seconds
  },
  { timestamps: true }
);

export default mongoose.model("GameHistory", gameHistorySchema);
