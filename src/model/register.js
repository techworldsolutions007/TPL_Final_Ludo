import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
    last_name: {
    type: String,
    required: true
  },
    dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  pic_url: {
    type: String,
    required: true
  }
  });

  export default mongoose.model("Register", registerSchema);