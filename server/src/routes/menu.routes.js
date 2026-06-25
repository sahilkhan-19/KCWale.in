import express from "express";
const router = express.Router();
import { getAllProducts, getSingleProduct, getCategories, getFeaturedProducts, createProduct, updateProduct, deleteProduct, toggleAvailability } from "../controllers/product.controller.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

router.get("/", getAllProducts);

router.get("/search", getAllProducts);

router.get("/categories", getCategories);

router.get("/featured", getFeaturedProducts);

router.get("/category/:category", getAllProducts);

router.get("/:id", getSingleProduct);

router.post("/", protect, isAdmin, createProduct);

router.put("/:id", protect, isAdmin, updateProduct);

router.patch(
  "/:id/toggle-availability",
  protect,
  isAdmin,
  toggleAvailability
);

router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;