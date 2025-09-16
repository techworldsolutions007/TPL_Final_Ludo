import cloudinary from '../config/cloudinaryConfig.js';
import streamifier from 'streamifier';


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

export const uploadMyCustomAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'file is required (multipart/form-data field: file)');

  // Validate file type quickly
  const mime = req.file.mimetype || '';
  if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(mime)) {
    throw new HttpError(400, 'Unsupported image type');
  }

  // Upload stream to Cloudinary
  const folder = `${process.env.CLOUDINARY_FOLDER || 'avatars'}/${req.user._id}`;
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, overwrite: true, invalidate: true, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  // Delete old if exists
  if (req.user.customAvatar?.publicId) {
    try { await cloudinary.uploader.destroy(req.user.customAvatar.publicId); } catch {}
  }

  // Save on player
  req.user.customAvatar = { url: uploadResult.secure_url, publicId: uploadResult.public_id };
  await req.user.save();

  res.json({
    ok: true,
    message: 'Custom avatar uploaded',
    data: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    }
  });
});

/**
 * Delete my CUSTOM avatar (if exists).
 * - Keeps catalog selection untouched.
 */
export const deleteMyCustomAvatar = asyncHandler(async (req, res) => {
  const publicId = req.user.customAvatar?.publicId;
  if (!publicId) return res.json({ ok: true, message: 'No custom avatar to delete' });

  try { await cloudinary.uploader.destroy(publicId); } catch {}

  req.user.customAvatar = { url: null, publicId: null };
  await req.user.save();

  res.json({ ok: true, message: 'Custom avatar deleted' });
});

/**
 * Select a catalog avatar I own (or a free one).
 * Body: { avatarId }
 */
export const selectCatalogAvatar = asyncHandler(async (req, res) => {
  const { avatarId } = req.body;
  if (!avatarId) throw new HttpError(400, 'avatarId is required');

  // Ensure player owns it or it's free; cheap check with aggregation
  const player = await Player.findById(req.user._id)
    .populate('ownedAvatars.avatar')
    .exec();

  const ownedIds = new Set(player.ownedAvatars.map(a => String(a.avatar._id)));
  const isOwnedOrFree = ownedIds.has(String(avatarId));

  // If not owned, we still allow selection ONLY if the avatar is free (price 0)
  // (We don't have the Avatar doc yet; do a quick fetch)
  let isFree = false;
  if (!isOwnedOrFree) {
    const { Avatar } = await import('../models/Avatar.js');
    const av = await Avatar.findById(avatarId);
    if (!av) throw new HttpError(404, 'Avatar not found');
    isFree = !av.isPaid || av.price === 0;
    if (!isFree) throw new HttpError(403, 'Avatar not owned');
  }

  player.currentAvatar = avatarId;
  await player.save();

  res.json({ ok: true, message: 'Avatar selected', data: { currentAvatar: avatarId } });
});
