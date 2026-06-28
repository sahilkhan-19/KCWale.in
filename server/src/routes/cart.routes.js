import express from "express";
const router = express.Router();
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

router.get("/", protect, getCart);

router.post("/add", protect, addToCart);

router.patch("/update-item/:itemId", protect, updateCartItem);

router.delete("/remove-item/:itemId", protect, removeCartItem);

router.delete("/clear", protect, clearCart);

export default router;