import mongoose from "mongoose";

const playerProfileAvatarSchema = new mongoose.Schema(
  {
    profileAvatarUrl: {
      type: String,
      required: true
    },
    profileAvatarId: {
      type: String,
      required: true,
      unique: true
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

export default mongoose.model("PlayerProfileAvatar", playerProfileAvatarSchema);
