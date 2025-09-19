import { Readable } from "stream";
import { mongoose } from "mongoose";
import cloudinary from "../config/cloudinaryConfig.js";
import PlayerProfileAvatar from "../model/PlayerProfileAvatar.js";
import profile from "../model/Profile.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Profile from "../model/Profile.js";

/** helper: upload buffer to cloudinary via stream */
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || process.env.CLOUDINARY_FOLDER || "avatars",
        resource_type: "image",
        // you can add transformations here if needed
        // transformation: [{ width: 512, height: 512, crop: "fill", gravity: "auto" }]
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });

/** POST /api/v1/avatars  (multipart/form-data: file=image, price=number) */
export const createAvatar = (async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Image file is required (field name: 'file')");
  }
  const price = Number(req.body.price ?? 0);
  if (Number.isNaN(price) || price < 0) {
    res.status(400);
    throw new Error("Invalid price");
  }

  const uploaded = await uploadToCloudinary(req.file.buffer);
  const doc = await PlayerProfileAvatar.create({
    profileAvatarId: req.body.profileAvatarId,
    profileAvatarUrl: uploaded.secure_url,
    price,
    PurchaseBy: [],
    cloudinaryPublicId: uploaded.public_id
  });

  res.status(201).json({ status: "success", data: doc });
});

/** GET /api/avatars?search=&minPrice=&maxPrice=&page=&limit= */
export const listAvatars = asyncHandler(async (req, res) => {
  const { search, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
  const q = {};
  if (search) {
    // simple search on URL (or add a 'name' field if you have one)
    q.profileAvatarUrl = { $regex: search, $options: "i" };
  }
  if (minPrice || maxPrice) {
    q.price = {};
    if (minPrice) q.price.$gte = Number(minPrice);
    if (maxPrice) q.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    PlayerProfileAvatar.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    PlayerProfileAvatar.countDocuments(q)
  ]);

  res.json({
    status: "success",
    data: items,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
  });
});

/** GET /api/avatars/:id */
export const getAvatar = asyncHandler(async (req, res) => {
  try {
    const profileAvatarId = req.params.id;
    const playerId = req.user._id;

    console.log(playerId, profileAvatarId);
    const doc = await PlayerProfileAvatar.findOne({ profileAvatarId: profileAvatarId }).populate("PurchaseBy", "name email");
    const user = await Profile.findById(playerId);

    if (!doc) {
      res.status(404);
      throw new Error("Avatar not found");
    }
    else if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.pic_url = doc.profileAvatarUrl;
    user.selected_pic_id = doc.profileAvatarId;
    user.save();
    res.json({ status: "success", profileAvatarUrl: doc.profileAvatarUrl });
  } catch (error) {
    console.error(error);
    res.json({ status: "failed", message: "internal server error" });
  }
});

/** PATCH /api/avatars/:id  (multipart/form-data optional file + price) */
export const updateAvatar = asyncHandler(async (req, res) => {
  const doc = await PlayerProfileAvatar.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error("Avatar not found");
  }

  // replace image if new file provided
  if (req.file) {
    // delete old on cloudinary if tracked
    if (doc.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(doc.cloudinaryPublicId);
      } catch (e) {
        // log and continue (do not block update)
        console.warn("Cloudinary destroy failed:", e?.message || e);
      }
    }
    const uploaded = await uploadToCloudinary(req.file.buffer);
    doc.profileAvatarUrl = uploaded.secure_url;
    doc.cloudinaryPublicId = uploaded.public_id;
  }

  // update price if provided
  if (typeof req.body.price !== "undefined") {
    const p = Number(req.body.price);
    if (Number.isNaN(p) || p < 0) {
      res.status(400);
      throw new Error("Invalid price");
    }
    doc.price = p;
  }

  await doc.save();
  res.json({ status: "success", data: doc });
});

/** DELETE /api/avatars/:id */
export const deleteAvatar = asyncHandler(async (req, res) => {
  const doc = await PlayerProfileAvatar.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error("Avatar not found");
  }

  // delete from cloudinary (safe to call even if already gone)
  if (doc.cloudinaryPublicId) {
    try {
      await cloudinary.uploader.destroy(doc.cloudinaryPublicId);
    } catch (e) {
      console.warn("Cloudinary destroy failed:", e?.message || e);
    }
  }

  await doc.deleteOne();
  res.json({ status: "success", message: "Avatar deleted" });
});

/** (Optional helper) POST /api/avatars/:id/purchase  body: { userId } */
export const addPurchaser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  // Validate Avatar ID format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid Avatar ID format");
  }

  // Fetch avatar and user in parallel
  const [avatar, user] = await Promise.all([
    PlayerProfileAvatar.findById(req.params.id),
    Profile.findById(userId)
  ]);

  // Check if avatar and user exist
  if (!avatar) {
    res.status(404);
    throw new Error("Avatar not found");
  }
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Ensure PurchaseBy is an array and handle undefined or null
  console.log(PlayerProfileAvatar.PurchaseBy);
  const purchaseBy = PlayerProfileAvatar.PurchaseBy || []; // Default to an empty array if undefined

  // Check if the user has already purchased the avatar
  const exists = purchaseBy.some((id) => id.toString() === userId.toString());

  // If not, add the user to the PurchaseBy array
  if (!exists) {
    purchaseBy.push(userId);
    PlayerProfileAvatar.PurchaseBy = purchaseBy; // Update the avatar object with the new PurchaseBy array
    await avatar.save();
  }

  // Send success response with the updated avatar
  res.json({ status: "success", data: avatar });
});
