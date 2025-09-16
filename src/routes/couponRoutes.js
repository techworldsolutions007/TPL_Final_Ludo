import express from 'express';
import { createCoupon, getCoupon, applyCoupon } from '../controllers/couponController.js';
import Coupon from '../model/Coupon.js'; // import your model here


const router = express.Router();
router.post('/create-coupon', createCoupon);
router.get('/coupon', getCoupon);
router.post('/apply-coupon', applyCoupon);

export default router;
