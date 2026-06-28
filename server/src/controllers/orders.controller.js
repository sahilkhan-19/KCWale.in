import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
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

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

// ==================== CALCULATE DELIVERY METRICS ====================
export const calculateDelivery = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // DEVELOPMENT ONLY — Log received coordinates
    console.log(`[Backend - calculateDelivery] Received coordinates: lat=${lat}, lng=${lng} (Raw: latitude=${latitude}, longitude=${longitude})`);

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

    const distResult = await calculateRoadDistance(lat, lng);
    const deliveryCharge = calculateDeliveryCharge(distResult.distanceInKm);

    return res.status(200).json({
      distanceInKm: distResult.distanceInKm,
      estimatedDuration: distResult.estimatedDuration,
      deliveryCharge,
      // DEVELOPMENT ONLY
      // Delivery radius validation is temporarily disabled for local testing.
      // Re-enable this line before production deployment.
      // ORIGINAL CODE: allowed: deliveryCharge !== -1 && distResult.distanceInKm <= 10.0,
      allowed: true,
      isFallback: distResult.isFallback
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==================== PLACE ORDER ====================
export const placeOrder = async (req, res) => {
  try {
    if (checkStoreClosed()) {
      return res.status(400).json({
        message: "Sorry cravers, we are closed today!",
      });
    }
    const userId = req.user.id;

    const {
      deliveryAddress,
      deliveryLocation,
      paymentMethod = "COD",
    } = req.body;

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
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

    // DEVELOPMENT ONLY — Log received coordinates in placeOrder
    console.log(`[Backend - placeOrder] Received coordinates: lat=${lat}, lng=${lng} (Raw: latitude=${latitude}, longitude=${longitude})`);

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

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const unavailableItem = cart.items.find(
      (item) =>
        !item.product || item.product.available === false
    );

    if (unavailableItem) {
      return res.status(400).json({
        message: `${unavailableItem.product.name} is currently unavailable`,
      });
    }

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
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    const settings = getSettings();
    const taxes = Number((subtotal * (settings.taxRate / 100)).toFixed(2));
    const grandTotal = Number((subtotal + deliveryCharge + taxes).toFixed(2));

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
      paymentMethod,
      paymentStatus: "pending",
    });

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    // Trigger Admin Notification Email asynchronously (does not block order response)
    sendAdminOrderNotification(order);

    // DEVELOPMENT ONLY — Log coordinates stored in DB
    console.log(`[Backend - placeOrder] Order created in MongoDB with ID ${order._id}. Location stored: lat=${order.deliveryLocation.latitude}, lng=${order.deliveryLocation.longitude}`);

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== GET MY ORDERS ====================
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      status,
      page = 1,
      limit = 10,
    } = req.query;

    if (
      Number(page) < 1 ||
      Number(limit) < 1
    ) {
      return res.status(400).json({
        message: "Invalid page or limit value",
      });
    }

    const filter = {
      user: userId,
    };

    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          message: "Invalid status filter",
        });
      }

      filter.status = status;
    }

    const skip =
      (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate(
          "items.product",
          "name images category"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Orders fetched successfully",
      orderCount: orders.length,
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(
          total / Number(limit)
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== GET SINGLE ORDER ====================
export const getSingleOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { id } = req.params;

    const order = await Order.findById(id).populate(
      "items.product",
      "name images category"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({
        message:
          "Not authorized to view this order",
      });
    }

    res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== CANCEL ORDER ====================
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({
        message:
          "Not authorized to cancel this order",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        message:
          "Cannot cancel an order that has already been delivered",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Order is already cancelled",
      });
    }

    order.status = "cancelled";

    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== ADMIN UPDATE ORDER STATUS ====================
export const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    if (
      !status ||
      !ORDER_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.status === "delivered" ||
      order.status === "cancelled"
    ) {
      return res.status(400).json({
        message: `Cannot update status of an order that is already ${order.status}`,
      });
    }

    order.status = status;

    // Automatically set payment status to paid if COD order is marked as delivered
    if (status === "delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "paid";
    }

    await order.save();

    res.status(200).json({
      message:
        "Order status updated successfully",
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== ADMIN UPDATE ORDER PAYMENT STATUS ====================
export const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validPaymentStatuses = ["pending", "confirmed", "failed", "paid"];
    if (!paymentStatus || !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.status(200).json({
      message: "Order payment status updated successfully",
      order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};