import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import razorpay from "../config/razorpay.js";

/*
|--------------------------------------------------------------------------
| Create Razorpay Order
|--------------------------------------------------------------------------
*/
export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id;

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

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const amountInPaise = totalAmount * 100;

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

    if (
      !deliveryAddress ||
      deliveryAddress.trim().length < 10
    ) {
      return res.status(400).json({
        message:
          "Delivery address must be at least 10 characters long",
      });
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
      price: item.product.price,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );

    /*
    |--------------------------------------------------------------------------
    | Create Order
    |--------------------------------------------------------------------------
    */

    const order = await Order.create({
      user: userId,

      items: orderItems,

      totalAmount,

      deliveryAddress: deliveryAddress.trim(),

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