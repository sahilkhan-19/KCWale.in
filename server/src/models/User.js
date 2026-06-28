import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    addresses: [
      {
        addressLabel: { type: String, required: true }, // "Home" | "Work" | "Other"
        formattedAddress: { type: String, required: true },
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
        },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
        isDefault: { type: Boolean, default: false }
      }
    ],

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },

    avatar: {
      type: String,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);