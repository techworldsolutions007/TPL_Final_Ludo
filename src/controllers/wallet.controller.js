import mongoose from "mongoose";
import Profile from "../model/Profile.js";
import WalletTxn from "../model/WalletTxn.js";

// Helper: basic input checks
function assertPositiveInt(n, field = "value") {
  if (!Number.isInteger(n) || n <= 0) {
    const err = new Error(`${field} must be a positive integer`);
    err.status = 400;
    throw err;
  }
}

export const addCoins = async (req, res, next) => {
  try {
    const {coinsPurchased, orderId, meta } = req.body || {};
    const playerId = req.user._id;
   
    // console.log(coinsPurchased);
    assertPositiveInt(coinsPurchased, "coinsPurchased");

    const user = await Profile.findById(playerId);
    console.log(user)
    if (!user) return res.status(404).json({ message: "User not found" });

    // If orderId is present, attempt tx insert first to enforce idempotency
    // let session = await mongoose.startSession();
    // await session.withTransaction(async () => {
    //   if (orderId) {
    //     // Create CREDIT txn first; unique index prevents duplicates
    //     await WalletTxn.create([{
    //       userId: user._id,
    //       type: "CREDIT",
    //       coins: coinsPurchased,
    //       orderId,
    //       meta
    //     }], { session });
    //   }

      // Atomic wallet update
      const updated = await Profile.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            wallet: coinsPurchased,
            totalCoinsPurchased: coinsPurchased
          }
        },
        { new: true }
      );

      // If no orderId, still log the transaction (no idempotency)
    //   if (!orderId) {
    //     await WalletTxn.create([{
    //       userId: user._id,
    //       type: "CREDIT",
    //       coins: coinsPurchased,
    //       meta
    //     }], { session });
    //   }

      res.status(200).json({
        message: "Coins added successfully",
        balance: updated.walletCoins,
        totalPurchased: updated.totalCoinsPurchased,
        user: updated
      });
    // session.endSession();
  } catch (err) {
    // Duplicate key => order already processed
    if (err?.code === 11000 && err?.keyPattern?.orderId) {
      return res.status(409).json({ message: "Order already credited (idempotent)" });
    }
    next(err);
  }
};

