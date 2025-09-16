import mongoose from "mongoose";

const playerBoardAvatarSchema = new mongoose.Schema(
  {
    boardAvatarUrl: {
      type: String,
      required: true
    },
    boardAvatarUrlActive: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      required: true,
      default: "Coming Soon"
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
