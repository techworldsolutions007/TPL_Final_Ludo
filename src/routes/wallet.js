import { Router } from "express";
import { addCoins,  } from "../controllers/wallet.controller.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Add (credit) coins purchased from Unity
router.post("/add-coins", auth, addCoins);


export default router;
