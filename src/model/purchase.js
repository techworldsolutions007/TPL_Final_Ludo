import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Avatar', required: true },
  price: { type: Number, required: true }, // chips charged
  meta: { type: Object }
}, { timestamps: true });

export const Purchase = mongoose.model('Purchase', PurchaseSchema);
