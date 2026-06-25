import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

// ==================== PLACE ORDER ====================
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      deliveryAddress,
      paymentMethod = "COD",
    } = req.body;

    if (!deliveryAddress || deliveryAddress.trim().length < 10) {
      return res.status(400).json({
        message:
          "Delivery address must be at least 10 characters long",
      });
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

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
      price: item.product.price,
    }));

    const totalAmount = orderItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      paymentStatus:
        paymentMethod === "COD" ? "pending" : "pending",
    });

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

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
          "name image category"
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
      "name image category"
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