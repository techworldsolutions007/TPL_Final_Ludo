import express from 'express'
import { OAuth2Client } from "google-auth-library";
import { SigningIn } from '../controllers/auth.js'
import multer from 'multer';
import Profile from '../model/Profile.js';
import { isAuthenticated } from '../middleware/auth.js';
const router = express.Router()
const upload = multer();
import jwt from "jsonwebtoken";



// Create Google OAuth2 client (replace with your Google client ID)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST route to verify Google token
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    console.log("token" + token);
    if (!token) {
      return res.status(400).json({ error: "Google token is required" });
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // same client ID from Google console
    });

    // Get user payload
    const payload = ticket.getPayload();

    const userData = {
      email: payload.email,
      name: payload.name,
      firstName: payload.given_name,
      lastName: payload.family_name || "",
      picture: payload.picture,
      email_verified: payload.email_verified,
    };
    const profile = await Profile.findOne({ email: userData.email });

    if (!profile) {
      const referCode = await generateReferralCode();
      profile = await Profile.create({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        dob: "",
        gender: "",
        pic_url: userData.picture,
        referral_code: referCode,
      });
    }
    const tokenPayload = {
      id: profile._id,
      email: profile.email,
    };

    const authToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    return res.status(200).json({
      message: profile.wasNew ? "User registered successfully" : "User signed in successfully",
      authToken,
      user: {
        id: profile._id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        picture: profile.pic_url,
      },
    });

  } catch (error) {
    console.error("Google Token Verification Error:", error);
    return res.status(401).json({ error: "Invalid Google token" });
  }
});

const generateReferralCode = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let exists = true;

  while (exists) {
    // Generate a random 6-character alphanumeric string
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code already exists in DB
    const existingUser = await Profile.findOne({ referral_code: code });
    exists = !!existingUser;
  }

  return code;
};

router.post('/signin', upload.none(), SigningIn)


export default router