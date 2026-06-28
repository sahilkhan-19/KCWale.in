import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";
import { getTransporter } from "../utils/email.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER_FOR_DEV");



export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const otp = crypto.randomInt(100000, 999999).toString();
    
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
    

    const transporter = getTransporter();
    if (transporter) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
            <h2 style="color: #ff5722; text-align: center;">Welcome to KC Wale!</h2>
            <p style="color: #333; font-size: 16px;">Hello,</p>
            <p style="color: #333; font-size: 16px;">Please use the following One-Time Password (OTP) to verify your email address and create your account. This code is valid for <strong>5 minutes</strong>.</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${otp}</span>
            </div>
            <p style="color: #777; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
          </div>
        `;

        await transporter.sendMail({
          from: '"KC Wale" <noreply@kcwale.in>',
          to: email,
          subject: "Verify Your Email - KC Wale",
          text: `Your KC Wale verification code is ${otp}. It will expire in 5 minutes.`,
          html: emailHtml
        });
      } catch (err) {
        console.log("[DEV] Failed to send email, but OTP is logged above.", err.message);
      }
    } else {
      console.log("[DEV] SMTP not configured. Skipping email send.");
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    if (!name || !email || !password || !phone || !otp) {
      return res.status(400).json({ message: "All fields and OTP are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }
    
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      isEmailVerified: true,
    });
    
    await Otp.deleteMany({ email });

    const token = generateToken(newUser._id);
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If the user has a password, verify it. If not (Google user), we'll let them verify via OTP and then save this new password.
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    }

    if (!otp) {
      const generatedOtp = crypto.randomInt(100000, 999999).toString();
      await Otp.deleteMany({ email });
      await Otp.create({ email, otp: generatedOtp });
      

      const transporter = getTransporter();
      if (transporter) {
        try {
          const loginHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px;">
              <h2 style="color: #ff5722; text-align: center;">KC Wale Login Verification</h2>
              <p style="color: #333; font-size: 16px;">Hello,</p>
              <p style="color: #333; font-size: 16px;">A login attempt was made for your account. Please use the following code to complete your sign-in. This code is valid for <strong>5 minutes</strong>.</p>
              <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${generatedOtp}</span>
              </div>
              <p style="color: #777; font-size: 12px; text-align: center;">If you did not attempt to log in, please secure your account immediately.</p>
            </div>
          `;

          await transporter.sendMail({
            from: '"KC Wale" <noreply@kcwale.in>',
            to: email,
            subject: "Your Login Code - KC Wale",
            text: `Your KC Wale login code is ${generatedOtp}. It will expire in 5 minutes.`,
            html: loginHtml
          });
        } catch (err) {
          console.log("[DEV] Failed to send email, but OTP is logged above.", err.message);
        }
      } else {
        console.log("[DEV] SMTP not configured. Skipping email send.");
      }
      
      return res.status(200).json({ message: "OTP sent to email", requiresOtp: true });
    } else {
      const otpRecord = await Otp.findOne({ email, otp });
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      await Otp.deleteMany({ email });

      // If the user didn't have a password before (Google signup), save this new password now that they verified their email via OTP
      if (!user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.authProvider = "both";
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential is required" });

    let payload;
    try {
      // Fetch user info using the access_token
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${credential}` },
      });
      if (!response.ok) throw new Error("Invalid Google token");
      payload = await response.json();
    } catch (err) {
      console.error("Google verify error:", err);
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const { email, name, sub, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        authProvider: "google",
        isEmailVerified: true,
        avatar: picture,
      });
    } else {
      if (!user.googleId) {
        user.googleId = sub;
        user.authProvider = "both";
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }
    }

    const token = generateToken(user._id);
    res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Google users might not have a password set yet, so we only check if user.password exists
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect current password" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // If authProvider was just "google", it becomes "both" now that they set a password
    if (user.authProvider === "google") {
      user.authProvider = "both";
    }
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
