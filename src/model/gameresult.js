// src/models/GameResult.js
import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  player_id: { 
    type: String, 
    required: [true, 'Player ID is required'] 
  },
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  status: { 
    type: String, 
    enum: {
      values: ['win', 'lose'],
      message: 'Status must be either "win" or "lose"'
    }, 
    required: [true, 'Status is required'] 
  },
  score: { 
    type: Number, 
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  }
});

const gameResultSchema = new mongoose.Schema({
  game_id: { 
    type: String, 
    required: [true, 'Game ID is required'],
    unique: [true, 'Game ID must be unique'],
    trim: true
  },
  players: {
    type: [playerSchema],
    required: [true, 'Players array is required'],
    validate: {
      validator: function(players) {
        return players && players.length >= 2;
      },
      message: 'At least 2 players are required'
    }
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Add indexes for better performance
gameResultSchema.index({ game_id: 1 });
gameResultSchema.index({ 'players.player_id': 1 });
gameResultSchema.index({ created_at: -1 });

const GameResult = mongoose.model('GameResult', gameResultSchema);
export default GameResult;