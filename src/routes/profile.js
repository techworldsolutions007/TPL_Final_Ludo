import { Router } from 'express';
import { playerProfile, updatePlayerProfile, updatePlayerProfileImage } from '../controllers/profile.js';
import { auth } from '../middleware/auth.js';
import multer from 'multer';
const upload = multer();

const router = Router();

router.post(
  '/playerProfile', auth, upload.single("pic_url"), playerProfile
);

// POST because we are updating profile
router.post("/playerProfile/:id", auth, upload.single("pic_url"), updatePlayerProfile);
router.post("/uploadPlayerProfile/:id", auth, upload.single("pic_url"), updatePlayerProfileImage);

export default router;
