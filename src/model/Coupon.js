// import mongoose from 'mongoose';

// // Define the Coupon schema
// const couponSchema = new mongoose.Schema({
//   code: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   discount: {
//     type: Number,
//     required: true,
//     min: 0,
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
//   expiryDate: {
//     type: Date,
//   },
  
// });

// const Coupon = mongoose.model('Coupon', couponSchema);
// export default Coupon;


import mongoose from 'mongoose';

// Define the Coupon schema
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // normalize coupon codes
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100, // percentage-based discount
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
    usageCount: {
      type: Number,
      default: 0, // how many times it has been used
    },
    maxUsage: {
      type: Number, // optional: limit total uses
    },
    minCart: {
      type: Number, // optional: minimum cart value required
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
