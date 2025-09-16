import Profile from '../model/Profile.js';

export const enterReferralCode = async (req, res) => {
  try {

    const { playerId, referralCode } = req.body;

    if (!playerId || !referralCode) {
      return res.status(400).json({ message: "playerId and referralCode are required" });
    }
    const user = await Profile.findById(playerId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.referred_by) {
      console.log("1");
      return res.status(400).json({ success: false, message: "Referral code already used by this user" });
    }
console.log(referralCode);
    const referrer = await Profile.findOne({ referral_code: referralCode });

    if (!referrer) {
      console.log("2", referrer);
      return res.status(404).json({ success: false, message: "Invalid referral code" });
    }

    if (referrer._id.equals(user._id)) {
      console.log("3");
      return res.status(400).json({ success: false, message: "You cannot refer yourself" });
    }

    // Apply referral
    user.referred_by = referralCode;
    user.wallet += 2500;
    user.referral_code_Bonus_Used = true;

    referrer.referrals.push(user._id);
    referrer.wallet += 5000;

    await user.save();
    await referrer.save();

    // Re-fetch user to confirm save worked
    const updatedUser = await Profile.findById(playerId);

    return res.status(200).json({
      success: true,
      message: "Referral code applied successfully",
      wallet: updatedUser.wallet,
      referred_by: updatedUser.referred_by,
      referral_code_Bonus_Used: true
    });
  } catch (err) {
    console.error("Referral code error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
