import { Avatar } from '../model/avatar.js';
import { Purchase } from '../model/purchase.js';
import cloudinary from '../config/cloudinaryConfig.js';
import streamifier from 'streamifier';
import mongoose from 'mongoose';


// Lightweight async wrapper (instead of express-async-handler)
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Simple HttpError helper (or use `import createError from 'http-errors'`)
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Admin: create an avatar in the store (with image file)
export const createStoreAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'file is required');
  const { name, isPaid = false, price = 0 } = req.body;
  if (!name) throw new HttpError(400, 'name is required');

  const folder = `${process.env.CLOUDINARY_FOLDER || 'avatars'}/catalog`;  
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  const avatar = await Avatar.create({
    name,
    isPaid: isPaid === 'true' || isPaid === true,
    price: Number(price) || 0,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  });

  res.status(201).json({ ok: true, data: avatar });
});

// List store avatars
export const listStoreAvatars = asyncHandler(async (req, res) => {
  const avatars = await Avatar.find().sort({ createdAt: -1 });
  res.json({ ok: true, data: avatars });
});

// Purchase a paid avatar (deduct chips, add to owned, select it)
export const purchaseAvatar = asyncHandler(async (req, res) => {
  const { avatarId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const avatar = await Avatar.findById(avatarId).session(session);
    if (!avatar) throw new HttpError(404, 'Avatar not found');
    if (!avatar.isPaid || avatar.price <= 0) throw new HttpError(400, 'Avatar is free; no purchase needed');

    const player = await (await import('../models/Player.js')).Player
      .findById(req.user._id)
      .session(session);

    const alreadyOwned = player.ownedAvatars.some(a => String(a.avatar) === String(avatar._id));
    if (alreadyOwned) throw new HttpError(400, 'Already owned');

    if (player.chips < avatar.price) throw new HttpError(402, 'Insufficient chips');

    // Deduct chips and grant ownership
    player.chips -= avatar.price;
    player.ownedAvatars.push({ avatar: avatar._id });
    player.currentAvatar = avatar._id;
    await player.save({ session });

    await Purchase.create([{
      player: player._id,
      avatar: avatar._id,
      price: avatar.price,
      meta: { reason: 'avatar_purchase' }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // (Optional) You can emit a Socket.IO event to your game namespace here.

    res.json({
      ok: true,
      message: 'Purchase successful; avatar selected.',
      data: {
        playerId: player._id,
        newChipBalance: player.chips,
        currentAvatar: avatar._id,
        avatarUrl: avatar.url
      }
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }
});

