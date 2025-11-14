// import User from "../../model/user.js";
// import CustomRoom from "../../model/customRoom.js";
// import Profile from "../../model/Profile.js";

// export const getDashboardData = async (req, res) => {
//   try {
//     // Total registered users
//     const totalUsers = await Profile.countDocuments();
//     console.log("hello sachin");

//     // Count total live players from active rooms
//     const liveRooms = await CustomRoom.find({ started: true, gameOver: false });
//     let livePlayers = 0;
//     liveRooms.forEach((room) => {
//       livePlayers += room.players.length;
//     });

//     // Total bid values from all rooms
//     const totalBidValues = await CustomRoom.aggregate([
//       { $group: { _id: null, total: { $sum: "$bet" } } },
//     ]);

//     res.json({
//       success: true,
//       message: "Dashboard data fetched successfully",
//       totalUsers,
//       livePlayers,
//       totalBidValues: totalBidValues[0]?.total || 0,
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

import admin from "../../config/firebaseConfig.js";
import CustomRoom from "../../model/customRoom.js";

export const getDashboardData = async (req, res) => {
  try {
    console.log("📊 Fetching dashboard data...");

    // 1️⃣ Total users from Firebase
    const userList = await admin.auth().listUsers(1000);
    const totalUsers = userList.users.length;

    // 2️⃣ Total games played (finished rooms)
    const totalGames = await CustomRoom.countDocuments({ gameOver: true });

    // 3️⃣ Live players (ongoing rooms)
    const activeRooms = await CustomRoom.find({
      started: true,
      gameOver: false,
    });
    let livePlayers = 0;
    activeRooms.forEach((r) => (livePlayers += r.players.length));

    res.json({
      success: true,
      message: "Dashboard data fetched successfully",
      totalUsers,
      totalGames,
      livePlayers,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


export const getActiveUsersLast7Days = async (req, res) => {
  try {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let nextPageToken = undefined;
    let activeCount = 0;
    let totalCount = 0;

    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      listUsersResult.users.forEach((user) => {
        totalCount++;
        const lastSignInTime = user.metadata.lastSignInTime
          ? new Date(user.metadata.lastSignInTime).getTime()
          : 0;
        if (lastSignInTime >= sevenDaysAgo) activeCount++;
      });
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    res.json({
      success: true,
      totalUsers: totalCount,
      activeLast7Days: activeCount,
    });
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};