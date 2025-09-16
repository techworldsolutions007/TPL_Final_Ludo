// src/routes/gameresultroutes.js
import express from 'express';
import {
  saveGameResult,
  declareWinner,
  declareLoser,
  getGameResults,
  getGameResult,
  getPlayerStats
} from '../controllers/gameresultcontroller.js';

const router = express.Router();

// POST /api/v1/ws/save-result - Save game result
router.post('/save-result', saveGameResult);

// POST /api/v1/ws/declare-winner - Declare winner
router.post('/declare-winner', declareWinner);

// POST /api/v1/ws/declare-loser - Declare loser
router.post('/declare-loser', declareLoser);

// GET /api/v1/ws/results - Get all game results
router.get('/results', getGameResults);

// GET /api/v1/ws/results/:game_id - Get specific game result
router.get('/results/:game_id', getGameResult);

// GET /api/v1/ws/player-stats/:player_id - Get player statistics
router.get('/player-stats/:player_id', getPlayerStats);

export default router;