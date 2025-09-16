import mongoose from 'mongoose';

const GameModeSchema = new mongoose.Schema(
  {
    // '2p' = Two Players, '4p' = Four Players
    mode: { type: String, enum: ['2p', '4p'], required: true, unique: true },
    entryFee: { type: Number, required: true, min: 0 },
    prizePool: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('GameMode', GameModeSchema);