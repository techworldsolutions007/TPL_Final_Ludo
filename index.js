import fs from "fs";
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import admin from "firebase-admin";

import dbConnect from './src/database/dbConnect.js';
import authRouter from './src/routes/auth.js';
import mobileOtp from "./src/routes/mobileOtp.js"
import playerRouter from './src/routes/player.js';
import commonRouter from './src/routes/common.js';
import adminKycRoutes from './src/routes/adminKycRoutes.js';
import kycRoutes from "./src/routes/kycRoutes.js"
import registerRouter from './src/routes/register.js';
import profileRoutes from './src/routes/profile.js';
import coupon from './src/routes/couponRoutes.js';
import gameModeRoutes from './src/routes/gamemoderoutes.js'
import playerprofileavatar from './src/routes/playerprofileavatarRoutes.js';
import playerBoardAvatar from './src/routes/playerBoardAvatarRoutes.js';
import walletRoutes from './src/routes/wallet.js';


import avatarRoutes from './src/routes/avatar.routes.js';
import storeRoutes from './src/routes/store.routes.js';
import adminRouter from './src/routes/admin.js';


// import gameRoutes  from './src/routes/gameresultroutes.js';  // Use named import

import { Server } from 'socket.io';
import { setupUnifiedGameSocket } from './src/socket/two-four-game.js';
import { enterReferralCode } from './src/controllers/refer.js';
import multer from 'multer';
import { isAuthenticated } from "./src/middleware/auth.js";
import PlayerBoardAvatar from "./src/model/PlayerBoardAvatar.js";
const upload = multer();

dotenv.config();
const app = express();
const server = http.createServer(app);

// Required for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccount = JSON.parse(
  fs.readFileSync("./ancient-ludo-2-firebase-adminsdk-fbsvc-d5cf9fc15f.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

// DB connection
dbConnect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true,
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Routes
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/api/v1/', authRouter);
app.use('/api/v1/', mobileOtp);
app.use('/api/v1/', registerRouter);
app.use('/api/v1/detail', profileRoutes);
// app.use('/api/v1/ws', gameRoutes);
app.use('/api/v1/game-modes', gameModeRoutes); // FIXED: Uncommented this line
app.use('/api/v1/apply', coupon);
app.use('/api/v1/player', playerRouter);
app.use('/api/v1/common/', commonRouter);
app.use("/api/v1/kyc/", kycRoutes);
app.use("/api/v1/refer/player", upload.none(), enterReferralCode);
app.use("/api/v1/playerprofileavatar", playerprofileavatar);
app.use("/api/v1/playerBoardAvatar", playerBoardAvatar );
app.use("/api/v1/wallet", walletRoutes);


app.use('/api/v1/avatars', avatarRoutes);
app.use('/api/v1/store', storeRoutes);

// Admin panel (EJS page)
app.use('/admin', adminKycRoutes);
app.use('/api/v1/admin', adminRouter);

// Test route for automation
app.get('/test', (req, res) => {
  console.log('automated test');
  res.send('hello from test');
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupUnifiedGameSocket(io.of('/'));

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});