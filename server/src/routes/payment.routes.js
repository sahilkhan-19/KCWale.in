import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post(
  "/create-order",
  protect,
  createRazorpayOrder
);

router.post(
  "/verify",
  protect,
  verifyPayment
);

export default router;