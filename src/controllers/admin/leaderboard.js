// import Profile from "../../model/Profile.js";
// import User from "../../model/user.js";

// export const getLeaderboard = async (req, res) => {
//   try {
//     const leaderboard = await Profile.find({})
//       .sort({ wincoin: -1 }) // highest wincoin first
//       .select("-user_token -device_token -bidvalues -my_token -__v");

//     const formattedLeaderboard = leaderboard.map((user, index) => ({
//       rank: index + 1,
//       ...user.toObject(), // spread all user fields
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Leaderboard fetched successfully",
//       leaderboard: formattedLeaderboard,
//     });
//   } catch (err) {
//     console.error("Error generating leaderboard:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// export const getAllAdmins = async (req, res) => {
//   try {
//     // query params ?page=1&limit=10
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const [admins, total] = await Promise.all([
//       Profile.find({ role: "admin" })
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }), // optional sorting
//       Profile.countDocuments({ role: "admin" }),
//     ]);

//     res.json({
//       success: true,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//       totalAdmins: total,
//       admins,
//     });
//   } catch (error) {
//     console.error("Error fetching admins:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

import Profile from "../../model/Profile.js";

/**
 * ---------------------------------------------------------------------
 *  GET /api/v1/admin/leaderboard
 * ---------------------------------------------------------------------
 *  Returns top leaderboard players sorted by wallet and win ratio.
 * ---------------------------------------------------------------------
 */
export const getLeaderboard = async (req, res) => {
  try {
    // Fetch all user-type profiles
    const players = await Profile.find({ role: "user" })
      .select(
        "first_name last_name email phone pic_url board_avatar_url role " +
          "games_won games_lost games_played two_players_win four_players_win " +
          "win_coin wallet totalCoinsPurchased referral_earnings createdAt updatedAt"
      )
      .lean();

    // Compute statistics
    const leaderboard = players.map((player) => {
      const totalWins =
        (player.two_players_win || 0) + (player.four_players_win || 0);
      const totalGames =
        player.games_played || totalWins + (player.games_lost || 0);
      const winRatio =
        totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

      return {
        _id: player._id,
        first_name: player.first_name,
        last_name: player.last_name,
        email: player.email,
        phone: player.phone || "",
        role: player.role,
        pic_url: player.pic_url,
        board_avatar_url: player.board_avatar_url,
        games_played: player.games_played || 0,
        games_won: player.games_won || totalWins,
        games_lost: player.games_lost || 0,
        two_players_win: player.two_players_win || 0,
        four_players_win: player.four_players_win || 0,
        win_coin: player.win_coin || 0,
        wallet: player.wallet || 0,
        totalCoinsPurchased: player.totalCoinsPurchased || 0,
        referral_earnings: player.referral_earnings || 0,
        winRatio,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      };
    });

    // Sort players: highest wallet → highest win ratio
    leaderboard.sort((a, b) => {
      if (b.wallet !== a.wallet) return b.wallet - a.wallet;
      return b.winRatio - a.winRatio;
    });

    // Assign ranks
    const rankedLeaderboard = leaderboard.map((player, index) => ({
      rank: index + 1,
      ...player,
    }));

    // Limit results (optional)
    const limit = parseInt(req.query.limit) || rankedLeaderboard.length;
    const limitedLeaderboard = rankedLeaderboard.slice(0, limit);

    res.status(200).json({
      success: true,
      message: "Leaderboard fetched successfully",
      totalPlayers: rankedLeaderboard.length,
      leaderboard: limitedLeaderboard,
    });
  } catch (err) {
    console.error("❌ Error generating leaderboard:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * ---------------------------------------------------------------------
 *  GET /api/v1/admin/all-admins
 * ---------------------------------------------------------------------
 *  Returns paginated admin list for dashboard.
 * ---------------------------------------------------------------------
 */
export const getAllAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      Profile.find({ role: "admin" })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select("first_name last_name email role createdAt updatedAt"),
      Profile.countDocuments({ role: "admin" }),
    ]);

    res.json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalAdmins: total,
      admins,
    });
  } catch (error) {
    console.error("❌ Error fetching admins:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
