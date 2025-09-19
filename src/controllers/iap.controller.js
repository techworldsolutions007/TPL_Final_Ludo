import Transaction from "../model/Transaction.js";
import Profile from "../model/Profile.js";

export const verifyIAP = async (req, res) => {
  const { userId, platform, purchaseToken, productId } = req.body;

  try {
    // 🔹 Verification logic directly here
    let verificationResult;

    if (platform === "android") {
      // TODO: Replace this with actual Google Play API call
      verificationResult = {
        valid: true,
        orderId: "GPA.1234-5678-9012-34567",
        amount: 100,
        coinAmount: 100
      };
    } else if (platform === "ios") {
      // TODO: Replace this with actual Apple API call
      verificationResult = {
        valid: true,
        orderId: "APPLE_ORDER_12345",
        amount: 100,
        coinAmount: 100
      };
    } else {
      return res.status(400).json({ error: "Invalid platform" });
    }

    if (!verificationResult.valid) {
      return res.status(400).json({ error: "Invalid purchase" });
    }

    // Prevent duplicate
    const existing = await Transaction.findOne({ orderId: verificationResult.orderId });
    if (existing) {
      return res.json({ message: "Already processed", coins: existing.coinAmount }); 
    }

    // Save transaction
    const transaction = await Transaction.create({
      userId,
      productId,
      platform,
      purchaseToken,
      orderId: verificationResult.orderId,
      amount: verificationResult.amount,
      coinAmount: verificationResult.coinAmount,
      status: "SUCCESS"
    });

    // Update user coins
    const user = await Profile.findById(userId);
    user.coins += verificationResult.coinAmount;
    await user.save();

    return res.json({ success: true, coins: user.coins, transaction });
  } catch (err) {
    console.error("IAP Verify Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
