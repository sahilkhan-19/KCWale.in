import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import addressRoutes from "./routes/address.routes.js";

const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/addresses", addressRoutes);

export default app;