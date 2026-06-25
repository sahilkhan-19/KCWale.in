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

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
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