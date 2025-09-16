import Profile from "../model/Profile.js";
// import register from "../model/register.js";
import jwt from "jsonwebtoken";
import shortid from 'shortid';


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const SigningIn = async (req, res) => {
  try {
    const {
      first_name,
      user_id,
      user_token,
      device_token,
      email,
      my_token,
      pic_url,
      provider 
    } = req.body || {}; // Safe fallback

    // Validate the data
    if (
      !first_name ||
      !user_id ||
      !user_token ||
      !device_token ||
      !email ||
      !my_token ||
      !pic_url
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if user already exists
    let user = await Profile.findOne({ email });
    let isNewUser = false;

    if (!user) {
      const referral_code = shortid.generate().toUpperCase();
      user = await Profile.create({
        first_name,
        user_id,
        user_token,
        device_token,
        email,
        my_token,
        pic_url,
        referral_code
      });
      isNewUser = true;
    }

    // 🚫 Block Apple Sign-In on Android
    if (isAppleProvider(provider) && isAndroidRequest(req)) {
      return res.status(400).json({
        success: false,
        code: 'APPLE_SIGNIN_NOT_SUPPORTED_ON_ANDROID',
        message: 'Sign in with Apple ID is not supported on Android devices.'
      });
    }

    // Create JWT token
    const tokenPayload = {
      id: user._id,
      first_name: user.first_name,
      email: user.email,
      role: "user",
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser
        ? "User created and logged in successfully"
        : "User logged in successfully",
      token,
      notice: "User Successfully Created !",
      playerid: user._id,
      username: email,
      pic_url: pic_url
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "User sign-in failed",
    });
  }
};

// utils/detectPlatform.js (optional helper)
export function isAndroidRequest(req) {
  const bodyPlatform = (req.body?.platform || '').toLowerCase();
  const headerPlatform = (req.headers['x-platform'] || '').toLowerCase();
  const ua = (req.headers['user-agent'] || '').toLowerCase();

  // Prefer explicit signals (body/header), fallback to UA sniffing
  if (bodyPlatform.includes('android') || headerPlatform.includes('android')) return true;
  if (ua.includes('android')) return true;
  return false;
}

export function isAppleProvider(provider) {
  const p = (provider || '').toLowerCase();
  return p === 'apple' || p === 'apple.com' || p === 'signin_with_apple';
}


