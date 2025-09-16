import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/uploadMiddleware.js';

import {
  createStoreAvatar,
  listStoreAvatars,
  purchaseAvatar
} from '../controllers/store.controller.js';

// If you have admin auth, add it; here we just reuse auth for example.
const router = Router();
router.get('/avatars', listStoreAvatars);
router.post('/avatars', auth, upload.single('file'), createStoreAvatar);   // protect with admin in real use
router.post('/avatars/:avatarId/purchase', auth, purchaseAvatar);

export default router;
 