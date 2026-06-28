import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import razorpay from "../config/razorpay.js";
import { calculateRoadDistance, calculateDeliveryCharge } from "../utils/location.js";
import { sendAdminOrderNotification } from "../utils/email.js";
import Setting from "../models/Setting.js";

const getSettings = async () => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    return settings;
  } catch (error) {
    console.error("Settings load failed", error);
    return { storeOpen: true, taxRate: 5, deliveryFee: 40, freeDeliveryThreshold: 499 };
  }
};

const checkStoreClosed = async () => {
  const settings = await getSettings();
  return settings.storeOpen === false;
};

/*
|--------------------------------------------------------------------------
| Create Razorpay Order
|--------------------------------------------------------------------------
*/
export const createRazorpayOrder = async (req, res) => {
  try {
    if (await checkStoreClosed()) {
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

    if (distResult.distanceInKm > 15.0) {
      return res.status(400).json({ message: "Sorry! KCWALE currently delivers only within 15 km of our kitchen." });
    }

    const deliveryCharge = calculateDeliveryCharge(distResult.distanceInKm);
    if (deliveryCharge === -1) {
      return res.status(400).json({ message: "Delivery not allowed to this location." });
    }

    const settings = await getSettings();
    const taxes = Number((subtotal * (settings.taxRate / 100)).toFixed(2));
    const grandTotal = Number((subtotal + deliveryCharge + taxes).toFixed(2));

    const amountInPaise = Math.round(grandTotal * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        address_house: house || "",
        address_floor: floor || "",
        address_building: building || "",
        address_street: street || "",
        address_area: area || "",
        address_landmark: landmark || "",
        address_city: city || "",
        address_state: state || "",
        address_pincode: pincode || "",
        address_apartment: apartment || "",
        location_latitude: lat.toString(),
        location_longitude: lng.toString(),
      }
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
/**
 * Shared helper to create an order after successful payment verification.
 * Safe to be called by both `/verify` and the webhook.
 */
export const executeOrderCreation = async ({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  deliveryAddress,
  deliveryLocation,
}) => {
  // Double-check duplicate to avoid race conditions
  const existingOrder = await Order.findOne({ razorpayPaymentId });
  if (existingOrder) {
    return { alreadyExists: true, order: existingOrder };
  }

  // Fetch Cart
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price available"
  );

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Re-check Product Availability
  const unavailableItem = cart.items.find(
    (item) => !item.product || item.product.available === false
  );
  if (unavailableItem) {
    throw new Error(`${unavailableItem.product.name} is currently unavailable`);
  }

  // Create Order Items Snapshot
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
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { house, floor, building, street, area, landmark, city, state, pincode, apartment } = deliveryAddress;
  const lat = parseFloat(deliveryLocation.latitude);
  const lng = parseFloat(deliveryLocation.longitude);

  const distResult = await calculateRoadDistance(lat, lng);
  const distance = distResult.distanceInKm;

  if (distance > 15.0) {
    throw new Error("Sorry! KCWALE currently delivers only within 15 km of our kitchen.");
  }

  const deliveryCharge = calculateDeliveryCharge(distance);
  if (deliveryCharge === -1) {
    throw new Error("Delivery not allowed to this location (outside service radius).");
  }

  const settings = await getSettings();
  const taxes = Number((subtotal * (settings.taxRate / 100)).toFixed(2));
  const grandTotal = Number((subtotal + deliveryCharge + taxes).toFixed(2));

  // Create Order
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
    razorpayOrderId,
    razorpayPaymentId,
  });

  // Clear Cart
  cart.items = [];
  await cart.save();

  // Trigger Admin Notification Email asynchronously
  sendAdminOrderNotification(order);

  return { alreadyExists: false, order };
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
    | Call Shared Order Creation Helper
    |--------------------------------------------------------------------------
    */
    const result = await executeOrderCreation({
      userId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      deliveryAddress,
      deliveryLocation,
    });

    if (result.alreadyExists) {
      console.log(`[Verify] Duplicate order skipped: ${razorpay_payment_id}`);
      return res.status(200).json({
        message: "Order already exists for this payment",
        order: result.order,
      });
    }

    console.log(`[Verify] Order created successfully via verifyPayment: ${result.order._id}`);
    res.status(201).json({
      message: "Payment verified successfully",
      order: result.order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Handle Razorpay Webhook Fallback
|--------------------------------------------------------------------------
*/
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.error("[Webhook] Missing signature or webhook secret");
      return res.status(400).json({ message: "Missing signature or secret" });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("[Webhook] Signature verification failed");
      return res.status(400).json({ message: "Invalid signature" });
    }

    console.log("[Webhook] Webhook received, signature verified");

    const event = req.body.event;

    // Handle payment.captured event
    if (event === "payment.captured") {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayPaymentId = paymentEntity.id;
      const razorpayOrderId = paymentEntity.order_id;
      const notes = paymentEntity.notes;

      if (!notes || !notes.userId) {
        console.warn(`[Webhook] Skipped: Payment ${razorpayPaymentId} has no notes or userId`);
        return res.status(200).json({ status: "ok", message: "Skipped: Missing order metadata in notes" });
      }

      // Check if order already exists
      const existingOrder = await Order.findOne({ razorpayPaymentId });
      if (existingOrder) {
        console.log(`[Webhook] Duplicate order skipped (already created): ${razorpayPaymentId}`);
        return res.status(200).json({ status: "ok", message: "Duplicate order skipped" });
      }

      // Reconstruct delivery details from notes
      const deliveryAddress = {
        house: notes.address_house,
        floor: notes.address_floor,
        building: notes.address_building,
        street: notes.address_street,
        area: notes.address_area,
        landmark: notes.address_landmark,
        city: notes.address_city,
        state: notes.address_state,
        pincode: notes.address_pincode,
        apartment: notes.address_apartment,
      };

      const deliveryLocation = {
        latitude: parseFloat(notes.location_latitude),
        longitude: parseFloat(notes.location_longitude),
      };

      const userId = notes.userId;

      const result = await executeOrderCreation({
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        deliveryAddress,
        deliveryLocation,
      });

      console.log(`[Webhook] Order created via webhook for payment: ${razorpayPaymentId}`);
      return res.status(200).json({ status: "ok", orderId: result.order._id });
    }

    // Handle payment.failed event
    if (event === "payment.failed") {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayPaymentId = paymentEntity.id;
      const errorDescription = paymentEntity.error_description || "Unknown error";
      console.log(`[Webhook] Payment failed: ${razorpayPaymentId}. Error: ${errorDescription}`);
      return res.status(200).json({ status: "ok", message: `Logged failure: ${errorDescription}` });
    }

    // Ignore all other events
    console.log(`[Webhook] Ignored unhandled event: ${event}`);
    return res.status(200).json({ status: "ok", message: `Ignored event: ${event}` });
  } catch (error) {
    console.error("[Webhook] Error executing webhook handler:", error);
    return res.status(500).json({ message: error.message });
  }
};