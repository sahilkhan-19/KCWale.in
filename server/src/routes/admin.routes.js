import express from "express";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

import {
  getDashboardStats,
  getAllOrders,
  getOrderById,
  getAllUsers,
  getSingleUser,
  updateUserRole,
} from "../controllers/admin.controller.js";

import { updateSettings } from "../controllers/settings.controller.js";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { updateOrderStatus, updateOrderPaymentStatus } from "../controllers/orders.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin Middleware
|--------------------------------------------------------------------------
| Every route below requires:
| 1. Valid JWT token
| 2. Admin role
|--------------------------------------------------------------------------
*/
router.use(protect, isAdmin);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/
router.get("/dashboard", getDashboardStats);

/*
|--------------------------------------------------------------------------
| Product / Menu Management
|--------------------------------------------------------------------------
*/
router.post("/products", createProduct);

router.put("/products/:id", updateProduct);

router.delete("/products/:id", deleteProduct);

/*
|--------------------------------------------------------------------------
| Order Management
|--------------------------------------------------------------------------
*/
router.get("/orders", getAllOrders);

router.get("/orders/:id", getOrderById);

// Update only order status
router.patch("/orders/:id/status", updateOrderStatus);

// Update order payment status
router.patch("/orders/:id/payment-status", updateOrderPaymentStatus);

/*
|--------------------------------------------------------------------------
| User Management
|--------------------------------------------------------------------------
*/
router.get("/users", getAllUsers);

router.get("/users/:id", getSingleUser);

// Update user role
router.patch("/users/:id/role", updateUserRole);

/*
|--------------------------------------------------------------------------
| System Settings
|--------------------------------------------------------------------------
*/
router.put("/settings", updateSettings);

export default router;