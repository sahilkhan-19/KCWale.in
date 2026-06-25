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

router.patch("/update/:productId", protect, updateCartItem);

router.delete("/remove/:productId", protect, removeCartItem);

router.delete("/clear", protect, clearCart);

export default router;