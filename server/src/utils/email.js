import nodemailer from "nodemailer";
import User from "../models/User.js";

let transporterInstance = null;

export const getTransporter = () => {
  if (transporterInstance) return transporterInstance;
  if (!process.env.SMTP_USER) return null;
  transporterInstance = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporterInstance;
};

export const sendAdminOrderNotification = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("[Email Service] ADMIN_EMAIL is not configured. Admin notification email skipped.");
      return;
    }

    // Fetch user details for the customer info
    const customer = await User.findById(order.user);
    const customerName = customer ? customer.name : "N/A";
    const customerPhone = customer ? customer.phone : "N/A";

    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left; font-size: 14px; color: #333;">
            <strong style="color: #111;">${item.name}</strong>
            ${
              item.selectedAddon
                ? `<br/><span style="font-size: 11px; color: #777;">Addon: ${item.selectedAddon.name} (+₹${item.selectedAddon.price})</span>`
                : ""
            }
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px; color: #555;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; color: #555;">₹${item.price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: bold; color: #111;">₹${item.price * item.quantity}</td>
        </tr>
      `
      )
      .join("");

    const addr = order.deliveryAddress;
    const formattedAddress = [
      addr.house,
      addr.apartment,
      addr.building,
      addr.street,
      addr.area,
      addr.landmark,
      addr.city,
      addr.state,
      addr.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    // Format date in IST
    const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const adminOrderUrl = `https://kcwale.in/admin/orders/${order._id}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2f5;">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">KCWALE</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px; font-weight: 500;">🔔 NEW ORDER RECEIVED</p>
          </div>

          <!-- Content Body -->
          <div style="padding: 30px;">
            
            <!-- Restaurant Info (Future-proofing) -->
            <div style="background-color: #fff8f5; border-left: 4px solid #ff5722; padding: 12px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 25px;">
              <span style="font-size: 12px; font-weight: bold; color: #ff5722; text-transform: uppercase; tracking-wider: 1px; display: block; margin-bottom: 2px;">Restaurant</span>
              <strong style="font-size: 16px; color: #111;">KC Kitchen</strong>
            </div>

            <!-- Summary Table -->
            <h3 style="color: #111; font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #eef2f5; padding-bottom: 8px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px;">
              <tr>
                <td style="padding: 6px 0; color: #666; width: 35%;">Order ID:</td>
                <td style="padding: 6px 0; color: #111; font-family: monospace; font-size: 13px; font-weight: bold;">#${order._id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666;">Date & Time (IST):</td>
                <td style="padding: 6px 0; color: #111; font-weight: 500;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666;">Order Status:</td>
                <td style="padding: 6px 0;"><span style="background-color: #ffebe5; color: #ff5722; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${order.status}</span></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666;">Payment Method:</td>
                <td style="padding: 6px 0; color: #111; font-weight: 500; text-transform: uppercase;">${order.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666;">Payment Status:</td>
                <td style="padding: 6px 0; color: #111; font-weight: 500; text-transform: uppercase;">${order.paymentStatus}</td>
              </tr>
            </table>

            <!-- Customer Details -->
            <h3 style="color: #111; font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #eef2f5; padding-bottom: 8px;">Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px;">
              <tr>
                <td style="padding: 6px 0; color: #666; width: 35%;">Name:</td>
                <td style="padding: 6px 0; color: #111; font-weight: 500;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666;">Phone:</td>
                <td style="padding: 6px 0; color: #111; font-weight: 500;">${customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; vertical-align: top;">Delivery Address:</td>
                <td style="padding: 6px 0; color: #111; font-weight: 500; line-height: 1.4;">${formattedAddress}</td>
              </tr>
            </table>

            <!-- Items Table -->
            <h3 style="color: #111; font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #eef2f5; padding-bottom: 8px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f7f9fa;">
                  <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: bold; color: #666; border-bottom: 2px solid #eef2f5;">Item</th>
                  <th style="padding: 10px; text-align: center; font-size: 12px; font-weight: bold; color: #666; border-bottom: 2px solid #eef2f5; width: 10%;">Qty</th>
                  <th style="padding: 10px; text-align: right; font-size: 12px; font-weight: bold; color: #666; border-bottom: 2px solid #eef2f5; width: 20%;">Price</th>
                  <th style="padding: 10px; text-align: right; font-size: 12px; font-weight: bold; color: #666; border-bottom: 2px solid #eef2f5; width: 25%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Pricing Summary -->
            <div style="background-color: #f7f9fa; border-radius: 12px; padding: 15px; margin-bottom: 30px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #666;">Delivery Charges:</td>
                  <td style="padding: 4px 0; text-align: right; color: #111; font-weight: 500;">₹${order.deliveryCharge || 0}</td>
                </tr>
                <tr style="border-top: 1px solid #eef2f5;">
                  <td style="padding: 8px 0 0 0; color: #111; font-size: 16px; font-weight: bold;">Grand Total:</td>
                  <td style="padding: 8px 0 0 0; text-align: right; color: #ff5722; font-size: 18px; font-weight: bold;">₹${order.totalAmount}</td>
                </tr>
              </table>
            </div>

            <!-- CTA View Link Button -->
            <div style="text-align: center; margin-top: 20px;">
              <a href="${adminOrderUrl}" target="_blank" style="background-color: #111111; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 14px; font-weight: bold; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: background-color 0.2s;">
                View Order in Admin Dashboard
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f7f9fa; padding: 20px; text-align: center; border-top: 1px solid #eef2f5; font-size: 11px; color: #777;">
            <p style="margin: 0;">This is an automated administrative notification sent from kcwale.in.</p>
            <p style="margin: 5px 0 0 0;">&copy; 2026 KCWALE. All Rights Reserved.</p>
          </div>

        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"KC Wale Admin" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `🔔 New Order #${order._id} | ₹${order.totalAmount} | KCWALE`,
        text: `New order received! Order ID: ${order._id}. Grand Total: ₹${order.totalAmount}. Customer Name: ${customerName}.`,
        html: emailHtml,
      });
      console.log(`[Email Service] Admin notification sent for order: ${order._id}`);
    }
  } catch (err) {
    console.error(`[Email Service] Failed to send admin order notification for ${order._id}:`, err.message);
  }
};
