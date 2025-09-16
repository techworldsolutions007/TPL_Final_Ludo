import Profile from '../model/Profile.js';

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Profile.find({})
      .sort({
        wincoin: -1
      })  // Sort by wincoin descending
      .limit(10)              // Top 10 players
      .select('first_name win_coin pic_url two_players_win four_players_win games_lost'); // Only get necessary fields

    const formattedLeaderboard = leaderboard.map(user => ({
      id: user._id,
      username: user.first_name,
      wincoin: user.win_coin,
      photo: user.pic_url,
      totalWin: user.two_players_win + user.four_players_win,
      match: user.two_players_win + user.four_players_win + user.games_lost
    }));

    // Top 3 players based on wincoin
    const topPlayers = [...formattedLeaderboard]
      .sort((a, b) => b.wincoin - a.wincoin)
      .slice(0, 3);

    // total winnings leaderboard (sorted by totalWin)
    const totalWinnings = [...formattedLeaderboard]
      .sort((a, b) => b.totalWin - a.totalWin)
      .slice(0, 10) // top 10
      .map(user => ({
        id: user.id,
        username: user.username,
        photo: user.photo,
        wincoin: user.wincoin,
        totalWin: user.totalWin
      }));

    // total matches leaderboard (sorted by match)
    const totalMatch = [...formattedLeaderboard]
      .sort((a, b) => b.match - a.match)
      .slice(0, 10) // top 10
      .map(user => ({
        id: user.id,
        username: user.username,
        photo: user.photo,
        wincoin: user.wincoin,
        match: user.match
      }));


    return res.status(200).json({
      totalWinnings: totalWinnings,
      totalMatch: totalMatch,
      topPlayers: topPlayers
    });

  } catch (err) {
    console.error("Error generating leaderboard:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
