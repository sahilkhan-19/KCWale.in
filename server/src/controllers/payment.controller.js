import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import razorpay from "../config/razorpay.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { calculateRoadDistance, calculateDeliveryCharge } from "../utils/location.js";
import { sendAdminOrderNotification } from "../utils/email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsFilePath = path.join(__dirname, "../config/settings.json");

const getSettings = () => {
  try {
    if (fs.existsSync(settingsFilePath)) {
      return JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));
    }
  } catch (error) {
    console.error("Settings load failed", error);
  }
  return { storeOpen: true, taxRate: 5, deliveryFee: 40, freeDeliveryThreshold: 499 };
};

const checkStoreClosed = () => {
  const settings = getSettings();
  return settings.storeOpen === false;
};

/*
|--------------------------------------------------------------------------
| Create Razorpay Order
|--------------------------------------------------------------------------
*/
export const createRazorpayOrder = async (req, res) => {
  try {
    if (checkStoreClosed()) {
      return res.status(400).json({
        message: "Sorry cravers, we are closed today!",
      });
    }
    const userId = req.user.id;
    const { deliveryAddress, deliveryLocation } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price available"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const unavailableItem = cart.items.find(
      (item) => !item.product || item.product.available === false
    );

    if (unavailableItem) {
      return res.status(400).json({
        message: `${unavailableItem.product.name} is currently unavailable`,
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.product.price + (item.selectedAddon?.price || 0)) * item.quantity,
      0
    );

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required." });
    }
    const { house, floor, building, street, area, landmark, city, state, pincode, apartment } = deliveryAddress;
    if (!house || !street || !area || !city || !state || !pincode) {
      return res.status(400).json({ message: "House No, Street, Area, City, State, and PIN Code are required in delivery address." });
    }

    if (!deliveryLocation) {
      return res.status(400).json({ message: "Coordinates are required to calculate payment total." });
    }
    const { latitude, longitude } = deliveryLocation;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Coordinates are required to calculate payment total." });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      !isFinite(lat) ||
      !isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({ message: "Invalid coordinates." });
    }

    const distResult = await calculateRoadDistance(lat, lng);
    // ============================================================
    // DEVELOPMENT ONLY
    // Delivery radius validation is temporarily disabled for local testing.
    // Re-enable this block before production deployment.
    // ============================================================
    // ORIGINAL CODE (uncomment for production):
    // if (distResult.distanceInKm > 10.0) {
    //   return res.status(400).json({ message: "Sorry! KCWALE currently delivers only within 10 km of our kitchen." });
    // }

    const deliveryCharge = calculateDeliveryCharge(distResult.distanceInKm);
    // ORIGINAL CODE (uncomment for production):
    // if (deliveryCharge === -1) {
    //   return res.status(400).json({ message: "Delivery not allowed to this location." });
    // }

    const settings = getSettings();
    const taxes = Number((subtotal * (settings.taxRate / 100)).toFixed(2));
    const grandTotal = Number((subtotal + deliveryCharge + taxes).toFixed(2));

    const amountInPaise = Math.round(grandTotal * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json({
      message: "Razorpay order created successfully",
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Verify Razorpay Payment
|--------------------------------------------------------------------------
*/
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      deliveryAddress,
      deliveryLocation,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification data missing",
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required." });
    }
    const { house, floor, building, street, area, landmark, city, state, pincode, apartment } = deliveryAddress;
    if (!house || !street || !area || !city || !state || !pincode) {
      return res.status(400).json({ message: "House No, Street, Area, City, State, and PIN Code are required in delivery address." });
    }

    if (!deliveryLocation) {
      return res.status(400).json({ message: "Delivery GPS location coordinates are required." });
    }
    const { latitude, longitude } = deliveryLocation;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Latitude and longitude coordinates are required." });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      !isFinite(lat) ||
      !isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({ message: "Invalid latitude or longitude coordinates." });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Razorpay Signature
    |--------------------------------------------------------------------------
    */

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Duplicate Orders
    |--------------------------------------------------------------------------
    */

    const existingOrder = await Order.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingOrder) {
      return res.status(400).json({
        message: "Order already exists for this payment",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Cart
    |--------------------------------------------------------------------------
    */

    const cart = await Cart.findOne({
      user: userId,
    }).populate(
      "items.product",
      "name price available"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Re-check Product Availability
    |--------------------------------------------------------------------------
    */

    const unavailableItem = cart.items.find(
      (item) =>
        !item.product ||
        item.product.available === false
    );

    if (unavailableItem) {
      return res.status(400).json({
        message: `${unavailableItem.product.name} is currently unavailable`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create Order Items Snapshot
    |--------------------------------------------------------------------------
    */

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price + (item.selectedAddon?.price || 0),
      selectedAddon: item.selectedAddon ? {
        name: item.selectedAddon.name,
        price: item.selectedAddon.price,
      } : undefined,
    }));

    const subtotal = orderItems.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );

    // Recalculate distance and verify coordinates on the server
    const distResult = await calculateRoadDistance(lat, lng);
    const distance = distResult.distanceInKm;

    // ============================================================
    // DEVELOPMENT ONLY
    // Delivery radius validation is temporarily disabled for local testing.
    // Re-enable this block before production deployment.
    // ============================================================
    // ORIGINAL CODE (uncomment for production):
    // if (distance > 10.0) {
    //   return res.status(400).json({
    //     message: "Sorry! KCWALE currently delivers only within 10 km of our kitchen.",
    //   });
    // }

    const deliveryCharge = calculateDeliveryCharge(distance);
    // ORIGINAL CODE (uncomment for production):
    // if (deliveryCharge === -1) {
    //   return res.status(400).json({
    //     message: "Delivery not allowed to this location (outside service radius).",
    //   });
    // }

    const settings = getSettings();
    const taxes = Number((subtotal * (settings.taxRate / 100)).toFixed(2));
    const grandTotal = Number((subtotal + deliveryCharge + taxes).toFixed(2));

    /*
    |--------------------------------------------------------------------------
    | Create Order
    |--------------------------------------------------------------------------
    */

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount: grandTotal,
      deliveryAddress: {
        house,
        floor,
        building,
        street,
        area,
        landmark,
        city,
        state,
        pincode,
        apartment,
      },
      deliveryLocation: {
        latitude: lat,
        longitude: lng,
      },
      distanceInKm: distance,
      estimatedDuration: distResult.estimatedDuration,
      deliveryCharge,
      paymentMethod: "ONLINE",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    /*
    |--------------------------------------------------------------------------
    | Clear Cart
    |--------------------------------------------------------------------------
    */

    cart.items = [];
    await cart.save();

    // Trigger Admin Notification Email asynchronously
    sendAdminOrderNotification(order);

    res.status(201).json({
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};