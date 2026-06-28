import express from "express";
import {
  placeOrder,
  getOrders,
  getSingleOrder,
  cancelOrder,
  calculateDelivery,
} from "../controllers/orders.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Order Management (Customer)
|--------------------------------------------------------------------------
*/

// Calculate delivery distance, duration and charge
router.post("/calculate-delivery", protect, calculateDelivery);

// Checkout and place order
router.post("/checkout", protect, placeOrder);

// Get all orders of logged-in user
router.get("/", protect, getOrders);

// Get single order details
router.get("/:id", protect, getSingleOrder);

// Cancel order
router.put("/cancel/:id", protect, cancelOrder);

export default router;