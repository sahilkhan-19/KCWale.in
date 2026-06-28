import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    storeOpen: {
      type: Boolean,
      default: true,
    },
    taxRate: {
      type: Number,
      default: 5,
    },
    deliveryFee: {
      type: Number,
      default: 40,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 499,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
