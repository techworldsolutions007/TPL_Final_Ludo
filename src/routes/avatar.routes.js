import { Router } from 'express';
import { auth } from '../middleware/auth.js';

import {
  uploadMyCustomAvatar,
  deleteMyCustomAvatar,
  selectCatalogAvatar
} from '../controllers/avatar.controller.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

// Player uploads/deletes their CUSTOM avatar image
router.post('/upload', auth, upload.single('file'), uploadMyCustomAvatar);
router.delete('/upload', auth, deleteMyCustomAvatar);

// Player selects a catalog avatar they own (or a free one)
router.patch('/select', auth, selectCatalogAvatar);

export default router;
