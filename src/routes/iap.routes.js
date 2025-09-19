import express from "express";
import { verifyIAP } from "../controllers/iap.controller.js";

const router = express.Router();

router.post("/verify", verifyIAP);

export default router;
