import { Router } from 'express';
import axios from "axios";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
const router = Router();

const MSG91_AUTH_KEY = "465008ABJmvmGm0ZN068a2f67aP1";
const TEMPLATE_ID = "68a2f457f198da63af3727f4";
const OTP_EXPIRY = 5;

// 1. Send OTP
router.post("/send-otp", async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        const response = await axios.post(
            `https://control.msg91.com/api/v5/otp`,
            {
                mobile: phoneNumber,    // must be with country code, e.g. +919876543210
                template_id: TEMPLATE_ID,
                expiry: OTP_EXPIRY
            },
            {
                headers: {
                    authkey: MSG91_AUTH_KEY,
                    "Content-Type": "application/json"
                }
            }
        );
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(400).json({ error: error.response?.data || error.message });
    }
});

// 2. Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        const response = await axios.post(
            `https://control.msg91.com/api/v5/otp/verify`,
            {
                mobile: phoneNumber,
                otp
            },
            {
                headers: {
                    authkey: MSG91_AUTH_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data.type === "success") {
            // 🔹 Check user in DB (pseudo-code)
            let user = await findUserByPhone(phoneNumber); // implement DB check

            if (!user) {
                user = await createUser({ phone: phoneNumber }); // create new user
            }

            // Generate custom JWT
            const myToken = jwt.sign({ uid: user.id, phone: phoneNumber }, JWT_SECRET, {
                expiresIn: "7d",
            });

            res.json({ success: true, user, token: myToken });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(400).json({ error: error.response?.data || error.message });
    }
});

// // 1. Send OTP
// router.post("/send-otp", async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;
//     // Call Firebase REST API to send OTP
//     const response = await axios.post(
//       `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${process.env.FIREBASE_API_KEY}`,
//       { phoneNumber, recaptchaToken: "unused" } // if using backend, recaptchaToken can be bypassed with "unused"
//     );

//     res.json({ sessionInfo: response.data.sessionInfo });
//   } catch (error) {
//     res.status(400).json({ error: error.response?.data || error.message });
//   }
// });

// // 2. Verify OTP
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { sessionInfo, otp } = req.body;

//     // Verify OTP with Firebase
//     const response = await axios.post(
//       `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${process.env.FIREBASE_API_KEY}`,
//       { sessionInfo, code: otp }
//     );

//     const idToken = response.data.idToken;

//     // Decode Firebase token to get phone number
//     const decoded = await admin.auth().verifyIdToken(idToken);
//     const phoneNumber = decoded.phone_number;

//     // 🔹 Check in your DB (pseudo code)
//     let user = await findUserByPhone(phoneNumber); // implement DB check

//     if (!user) {
//       user = await createUser({ phone: phoneNumber }); // create new user
//     }

//     // Generate your own JWT
//     const myToken = jwt.sign({ uid: user.id, phone: phoneNumber }, JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.json({
//       success: true,
//       phone: phoneNumber,
//       user,
//       token: myToken,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.response?.data || error.message });
//   }
// });

export default router;
