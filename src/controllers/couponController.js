// import Coupon from '../model/Coupon.js'; // Ensure the '.js' extension is included
// import router from '../routes/auth.js';


// // Controller to get a coupon by code

// // Controller to create a new coupon
// export const createCoupon = async (req, res) => {
//   try {
//     const { code, discount, isActive = true, expiryDate } = req.body;

//     // Validation
//     if (!code || typeof discount === 'undefined') {
//       return res.status(400).json({ message: 'Code and discount are required' });
//     }

//     // Check if coupon already exists
//     const existing = await Coupon.findOne({ code });
//     if (existing) {
//       return res.status(409).json({ message: 'Coupon code already exists' });
//     }

//     // Create new coupon
//     const coupon = new Coupon({
//       code,
//       discount,
//       isActive,
//       expiryDate,
//     });

//     await coupon.save();

//     return res.status(201).json({
//       message: 'Coupon created successfully',
//       data: coupon,
//     });
//   } catch (err) {
//     console.error('Error creating coupon:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// export const getCoupon = async (req, res) => {
//   try {
//     const { code } = req.params; // Get coupon code from the URL params
//     const coupon = await Coupon.findOne({ code });

//     if (!coupon) {
//       return res.status(404).json({ message: 'Coupon not found' });
//     }

//     // Check if coupon is expired
//     if (coupon.expiryDate && coupon.expiryDate < Date.now()) {
//       return res.status(400).json({ message: 'Coupon has expired' });
//     }

//     return res.status(200).json(coupon);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// // Controller to apply the coupon
// export const applyCoupon = async (req, res) => {
//   try {
//     const { code, totalAmount } = req.body; // Get coupon code and total amount from the request body
//     const coupon = await Coupon.findOne({ code });

//     if (!coupon) {
//       return res.status(404).json({ message: 'Coupon not found' });
//     }

//     // Check if coupon is active and valid
//     if (!coupon.isActive) {
//       return res.status(400).json({ message: 'Coupon is not active' });
//     }

//     // Check if coupon is expired
//     if (coupon.expiryDate && coupon.expiryDate < Date.now()) {
//       return res.status(400).json({ message: 'Coupon has expired' });
//     }

//     // Apply the coupon discount
//     const discountedPrice = totalAmount - (totalAmount * coupon.discount) / 100;

//     return res.status(200).json({
//       message: 'Coupon applied successfully',
//       discountedPrice,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// export default router;




import Coupon from '../model/Coupon.js';

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is required (JSON)' });
    }
    
    let { code, discount, isActive = true, expiryDate } = req.body;

    if (!code || typeof discount === 'undefined') {
      return res.status(400).json({ message: 'Code and discount are required' });
    }

    // Normalize
    code = String(code).trim().toUpperCase();
    discount = Number(discount);
    if (Number.isNaN(discount) || discount < 0 || discount > 100) {
      return res.status(400).json({ message: 'discount must be a number between 0 and 100' });
    }

    // Unique check
    const existing = await Coupon.findOne({ code });
    if (existing) {
      return res.status(409).json({ message: 'Coupon code already exists' });
    }

    // Optional expiry date parsing
    let expiry = undefined;
    if (expiryDate) {
      const dt = new Date(expiryDate);
      if (Number.isNaN(dt.getTime())) {
        return res.status(400).json({ message: 'expiryDate must be a valid date' });
      }
      expiry = dt;
    }

    const coupon = await Coupon.create({
      code,
      discount,
      isActive: Boolean(isActive),
      expiryDate: expiry,
    });

    return res.status(201).json({
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (err) {
    console.error('Error creating coupon:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get by code (expects /coupon/:code)
export const getCoupon = async (req, res) => {
  try {
    const code = String(req.query?.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'code param is required' });

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    if (coupon.expiryDate && coupon.expiryDate.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    return res.status(200).json(coupon);
  } catch (err) {
    console.error('getCoupon error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Apply coupon (expects JSON body)
export const applyCoupon = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is required (JSON)' });
    }

    const code = String(req.body.code || '').trim().toUpperCase();
    const totalAmount = Number(req.body.totalAmount);

    if (!code || Number.isNaN(totalAmount)) {
      return res.status(400).json({ message: 'code and totalAmount are required' });
    }

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    if (!coupon.isActive) return res.status(400).json({ message: 'Coupon is not active' });
    if (coupon.expiryDate && coupon.expiryDate.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    const discountAmount = (totalAmount * coupon.discount) / 100;
    const discountedPrice = Math.max(0, totalAmount - discountAmount);

    return res.status(200).json({
      message: 'Coupon applied successfully',
      originalPrice: totalAmount,
      discountPercent: coupon.discount,
      discountAmount,
      discountedPrice,
      code: coupon.code,
    });
  } catch (err) {
    console.error('applyCoupon error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
