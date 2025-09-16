import mongoose from "mongoose";

const WalletTxnSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
    coins: { type: Number, required: true, min: 1 },
    // Use orderId/purchaseToken from Play/App Store to prevent double-credit
    orderId: { type: String, index: true }, 
    meta: { type: Object }, // anything else you want to store from Unity
  },
  { timestamps: true }
);

// Prevent duplicate order credits: one (userId, orderId) pair should be unique
WalletTxnSchema.index({ userId: 1, orderId: 1 }, { unique: true, sparse: true });

export default mongoose.model("WalletTxn", WalletTxnSchema);
