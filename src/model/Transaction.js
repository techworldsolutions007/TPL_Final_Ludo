import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: String, required: true },
  platform: { type: String, enum: ["android", "ios"], required: true },
  purchaseToken: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  coinAmount: { type: Number, required: true },
  status: { type: String, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
