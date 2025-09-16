import express from 'express';
import { Register, UpdateUser } from '../controllers/register.js';
import multer from 'multer';
const router = express.Router();
const upload = multer();

// POST Route for Registration
router.post('/register', upload.single("pic_url"), Register);

// PUT Route for Updating User Details
router.put('/update/:userId', upload.single("pic_url"), UpdateUser);

export default router;
