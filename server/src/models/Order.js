import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        // Snapshot of product name at purchase time
        name: {
          type: String,
          required: true,
          trim: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        // Snapshot of product price at purchase time
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        selectedAddon: {
          name: { type: String },
          price: { type: Number }
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    deliveryAddress: {
      house: { type: String, required: true, trim: true },
      apartment: { type: String, trim: true },
      street: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },

    deliveryLocation: {
      latitude: {
        type: Number,
        required: true,
        min: [-90, "Latitude must be between -90 and 90"],
        max: [90, "Latitude must be between -90 and 90"]
      },
      longitude: {
        type: Number,
        required: true,
        min: [-180, "Longitude must be between -180 and 180"],
        max: [180, "Longitude must be between -180 and 180"]
      }
    },

    distanceInKm: {
      type: Number
    },

    estimatedDuration: {
      type: Number
    },

    deliveryCharge: {
      type: Number
    },

    // For future Razorpay integration
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Order", orderSchema);
