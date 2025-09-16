import { Router } from 'express';
import { getGameModes, upsertGameMode } from '../controllers/gamemodecontroller.js';

const router = Router();

router.get('/', getGameModes);     // GET  /api/v1/game-modes
router.put('/', upsertGameMode);   // PUT  /api/v1/game-modes

export default router;