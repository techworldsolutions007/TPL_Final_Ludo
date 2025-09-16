// src/controllers/gamemodecontroller.js

// FIXED: Correct import path - changed '../models/GameMode.js' to '../model/gamemode.js'
import GameMode from '../model/gamemode.js';

// Utility: format ms to "Xm Ys" / "Xh Ym Zs"
function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * GET /api/v1/game-modes
 * Optional countdown inputs:
 *  - ?expiresIn=165            (seconds remaining)
 *  - ?expiresAt=2025-08-21T07:00:00.000Z  (ISO end time)
 *  - ?startedAt=<ISO>&durationSec=180     (start+duration -> remaining)
 */
export const getGameModes = async (req, res) => {
  try {
    const modes = await GameMode.find({})
      .select('mode entryFee prizePool -_id')
      .lean();

    // Calculate an optional countdown
    const { expiresIn, expiresAt, startedAt, durationSec } = req.query;
    const now = Date.now();
    let remainingMs = null;

    if (expiresIn) {
      remainingMs = Number(expiresIn) * 1000;
    } else if (expiresAt) {
      remainingMs = new Date(expiresAt).getTime() - now;
    } else if (startedAt && durationSec) {
      remainingMs = new Date(startedAt).getTime() + Number(durationSec) * 1000 - now;
    }

    const countdown = remainingMs == null ? null : formatDuration(Math.max(0, remainingMs));

    // Example response shape
    return res.json({
      serverTime: new Date().toISOString(),
      countdown,              // e.g., "2m 45s" (or null if you didn't pass timing)
      modes                    // [{ mode:'2p', entryFee:100, prizePool:180 }, { mode:'4p', ...}]
    });
  } catch (err) {
    console.error('getGameModes error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * PUT /api/v1/game-modes
 * Body: { mode: '2p'|'4p', entryFee: Number, prizePool: Number }
 * Upserts/updates the values (so you can switch 180/100 to 200/500 anytime).
 */
export const upsertGameMode = async (req, res) => {
  try {
    const { mode, entryFee, prizePool } = req.body;

    if (!mode || !['2p', '4p'].includes(mode)) {
      return res.status(400).json({ message: "Invalid 'mode' (use '2p' or '4p')" });
    }
    if (typeof entryFee !== 'number' || typeof prizePool !== 'number') {
      return res.status(400).json({ message: "'entryFee' and 'prizePool' must be numbers" });
    }

    const doc = await GameMode.findOneAndUpdate(
      { mode },
      { entryFee, prizePool },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return res.status(200).json({
      message: 'Saved',
      data: { mode: doc.mode, entryFee: doc.entryFee, prizePool: doc.prizePool }
    });
  } catch (err) {
    console.error('upsertGameMode error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};