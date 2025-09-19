import mongoose from "mongoose";

const playerBoardAvatarSchema = new mongoose.Schema(
  {
    boardAvatarId: {
      type: String,
      required: true,
      unique: true
    },
    boardAvatarUrl: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    availability: {
      type: Boolean,
      default: true
    },
    purchaseBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
      }
    ]
  },
  { timestamps: true, strictPopulate: false }
);

export default mongoose.model("PlayerBoardAvatar", playerBoardAvatarSchema);
