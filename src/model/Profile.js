import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    pic_url: {
      type: String,
      required: true,

    },
    selected_pic_id: {
      type: String,
      required: false,

    },
    board_avatar_url: {
      type: String,
      required: false,
    },
    player_BoardAvatar_SelectedId: {
      type: String,
      required: false,
    },
    first_name: {
      type: String,
      required: true,

    },
    last_name: {
      type: String,
      required: false,

    },
    email: {
      type: String,
      required: true,
      unique: true

    },
    phone: {
      type: String,
      required: false,
      default: null

    },
    password: {
      type: String
    },
    referral_code: {
      type: String,
      maxlength: 6,
      required: true,
      unique: true
    },
    referral_code_Bonus_Used: {
      type: Boolean,
      default: false
    },
    referrals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile"
    }],
    games_won: {
      type: Number,
      default: 0
    },
    games_lost: {
      type: Number,
      default: 0
    },
    games_played: {
      type: Number,
      default: 0
    },
    two_players_win: {
      type: Number,
      default: 0
    },
    four_players_win: {
      type: Number,
      default: 0
    },
    win_coin: {
      type: Number,
      default: 0
    },
    wallet: {
      type: Number,
      default: 5000
    },
    totalCoinsPurchased: {
      type: Number,
      default: 0
    },
    referral_earnings: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Optional consistency checks (server-side safety)
ProfileSchema.pre('validate', function (next) {
  // If games_played is provided, ensure it's >= won+lost
  const total = (this.games_won || 0) + (this.games_lost || 0);
  if (this.games_played < total) {
    return next(
      new Error('games_played cannot be less than games_won + games_lost')
    );
  }
  // Optional: ensure granular wins do not exceed total wins
  const smallWins = (this.two_players_win || 0) + (this.four_players_win || 0);
  if (smallWins > this.games_won) {
    return next(
      new Error('two_players_win + four_players_win cannot exceed games_won')
    );
  }
  next();
});


export default mongoose.model('Profile', ProfileSchema);
