import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from "../controllers/address.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAddresses);
router.post("/", protect, addAddress);
router.put("/:addressId", protect, updateAddress);
router.delete("/:addressId", protect, deleteAddress);
router.patch("/:addressId/default", protect, setDefaultAddress);

export default router;
