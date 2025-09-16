import mongoose from 'mongoose';

const AvatarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },           // in chips
  url: { type: String, required: true },
  publicId: { type: String, required: true },     // Cloudinary public_id
}, { timestamps: true });

export const Avatar = mongoose.model('Avatar', AvatarSchema);
