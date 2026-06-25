import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

/*
|--------------------------------------------------------------------------
| Dashboard Stats
|--------------------------------------------------------------------------
*/
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments(),

      Order.countDocuments(),

      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const statusCounts = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };

    ordersByStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    res.status(200).json({
      message: "Dashboard stats fetched successfully",

      stats: {
        totalUsers,
        totalProducts,
        totalOrders,

        totalRevenue:
          revenueResult[0]?.totalRevenue || 0,

        ...statusCounts,
      },

      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Orders
|--------------------------------------------------------------------------
*/
export const getAllOrders = async (req, res) => {
  try {
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

    const filter = {};

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
          "user",
          "name email phone"
        )
        .populate(
          "items.product",
          "name image"
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

/*
|--------------------------------------------------------------------------
| Get Single Order
|--------------------------------------------------------------------------
*/
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate(
        "user",
        "name email phone"
      )
      .populate(
        "items.product",
        "name image price"
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
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

/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
*/
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
    } = req.query;

    if (
      Number(page) < 1 ||
      Number(limit) < 1
    ) {
      return res.status(400).json({
        message: "Invalid page or limit value",
      });
    }

    const filter = {};

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip =
      (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      User.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Users fetched successfully",

      userCount: users.length,

      users,

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

/*
|--------------------------------------------------------------------------
| Get Single User
|--------------------------------------------------------------------------
*/
export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};