// src/controllers/gameresultcontroller.js
import GameResult from '../models/GameResult.js';

// Save complete game result
export const saveGameResult = async (req, res) => {
  try {
    // Check if req.body exists and has data
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('Request body is empty or undefined');
      return res.status(400).json({ 
        success: false,
        message: 'Request body is required',
        error: 'Cannot destructure property from undefined request body'
      });
    }

    // Log the incoming request body for debugging
    console.log('Request body received:', JSON.stringify(req.body, null, 2));

    const { game_id, players } = req.body;

    // Validate required fields with detailed error messages
    if (!game_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Game ID is required',
        error: 'game_id field is missing from request body'
      });
    }

    if (!players || !Array.isArray(players)) {
      return res.status(400).json({ 
        success: false,
        message: 'Players array is required',
        error: 'players field must be an array'
      });
    }

    if (players.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'At least 2 players are required',
        error: 'players array must contain at least 2 players'
      });
    }

    // Validate each player object in the array
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (!player.player_id) {
        return res.status(400).json({ 
          success: false,
          message: `Player ID is required for player at index ${i}`,
          error: 'Each player must have a player_id field'
        });
      }
      if (!player.username) {
        return res.status(400).json({ 
          success: false,
          message: `Username is required for player at index ${i}`,
          error: 'Each player must have a username field'
        });
      }
      if (!player.status || !['win', 'lose'].includes(player.status)) {
        return res.status(400).json({ 
          success: false,
          message: `Valid status (win/lose) is required for player at index ${i}`,
          error: 'Each player must have a status field with value "win" or "lose"'
        });
      }
      if (typeof player.score !== 'number' || player.score < 0) {
        return res.status(400).json({ 
          success: false,
          message: `Valid score is required for player at index ${i}`,
          error: 'Each player must have a numeric score field greater than or equal to 0'
        });
      }
    }

    // Check if game result already exists
    const existingGame = await GameResult.findOne({ game_id });
    if (existingGame) {
      return res.status(409).json({ 
        success: false,
        message: 'Game result already exists',
        error: `Game with ID ${game_id} already exists in database`
      });
    }

    // Create and save new game result
    const gameResult = new GameResult({
      game_id,
      players
    });

    await gameResult.save();
    
    console.log('Game result saved successfully:', game_id);
    
    return res.status(201).json({ 
      success: true,
      message: 'Game result saved successfully', 
      data: gameResult 
    });
    
  } catch (error) {
    console.error('Error saving game result:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        error: error.message 
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        message: 'Duplicate game ID',
        error: 'A game with this ID already exists'
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error while saving game result', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Declare winner for a specific game
export const declareWinner = async (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ 
        success: false,
        message: 'Request body is required' 
      });
    }

    const { game_id, player_id, score } = req.body;

    // Validate required fields
    if (!game_id || !player_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Game ID and Player ID are required',
        error: 'Missing required fields: game_id and/or player_id'
      });
    }

    // Find the game and update the player status to 'win'
    const gameResult = await GameResult.findOne({ game_id });
    
    if (!gameResult) {
      return res.status(404).json({ 
        success: false,
        message: 'Game not found',
        error: `No game found with ID: ${game_id}`
      });
    }

    // Update player status to win and set score
    const playerIndex = gameResult.players.findIndex(p => p.player_id === player_id);
    if (playerIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Player not found in this game',
        error: `Player ${player_id} not found in game ${game_id}`
      });
    }

    gameResult.players[playerIndex].status = 'win';
    if (score !== undefined) {
      gameResult.players[playerIndex].score = score;
    }

    await gameResult.save();

    return res.status(200).json({ 
      success: true,
      message: 'Winner declared successfully', 
      data: gameResult 
    });
  } catch (error) {
    console.error('Error declaring winner:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error declaring winner', 
      error: error.message 
    });
  }
};

// Declare loser for a specific game
export const declareLoser = async (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ 
        success: false,
        message: 'Request body is required' 
      });
    }

    const { game_id, player_id } = req.body;

    // Validate required fields
    if (!game_id || !player_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Game ID and Player ID are required',
        error: 'Missing required fields: game_id and/or player_id'
      });
    }

    // Find the game and update the player status to 'lose'
    const gameResult = await GameResult.findOne({ game_id });
    
    if (!gameResult) {
      return res.status(404).json({ 
        success: false,
        message: 'Game not found',
        error: `No game found with ID: ${game_id}`
      });
    }

    // Update player status to lose
    const playerIndex = gameResult.players.findIndex(p => p.player_id === player_id);
    if (playerIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Player not found in this game',
        error: `Player ${player_id} not found in game ${game_id}`
      });
    }

    gameResult.players[playerIndex].status = 'lose';
    await gameResult.save();

    return res.status(200).json({ 
      success: true,
      message: 'Loser declared successfully', 
      data: gameResult 
    });
  } catch (error) {
    console.error('Error declaring loser:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error declaring loser', 
      error: error.message 
    });
  }
};

// Get all game results
export const getGameResults = async (req, res) => {
  try {
    // Optional query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await GameResult.find()
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await GameResult.countDocuments();

    return res.status(200).json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching game results:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching results', 
      error: error.message 
    });
  }
};

// Get specific game result by game_id
export const getGameResult = async (req, res) => {
  try {
    const { game_id } = req.params;
    
    if (!game_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Game ID parameter is required' 
      });
    }

    const result = await GameResult.findOne({ game_id });
    
    if (!result) {
      return res.status(404).json({ 
        success: false,
        message: 'Game result not found',
        error: `No game found with ID: ${game_id}`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching game result:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching game result', 
      error: error.message 
    });
  }
};

// Get player statistics
export const getPlayerStats = async (req, res) => {
  try {
    const { player_id } = req.params;
    
    if (!player_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Player ID parameter is required' 
      });
    }

    const playerGames = await GameResult.find({ 
      'players.player_id': player_id 
    });

    const totalGames = playerGames.length;
    const wins = playerGames.filter(game => 
      game.players.find(p => p.player_id === player_id && p.status === 'win')
    ).length;
    const losses = totalGames - wins;
    const totalScore = playerGames.reduce((sum, game) => {
      const player = game.players.find(p => p.player_id === player_id);
      return sum + (player?.score || 0);
    }, 0);
    const averageScore = totalGames > 0 ? totalScore / totalGames : 0;

    const stats = {
      player_id,
      total_games: totalGames,
      wins,
      losses,
      win_rate: totalGames > 0 ? (wins / totalGames * 100).toFixed(2) + '%' : '0%',
      total_score: totalScore,
      average_score: averageScore.toFixed(2)
    };

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching player stats', 
      error: error.message 
    });
  }
};