# 🌙 KCWale.in

### **Night with KCWale - Your late night food, just a few clicks away.**

**KCWale.in** is a production-ready, mobile-first food ordering platform built for a cloud kitchen in Aligarh, Uttar Pradesh.

The platform enables customers to discover food, browse categories, search the menu, manage their cart, securely pay online, track their orders, manage delivery addresses, and view their order history — all through a modern, responsive interface.

Built with the **MERN stack**, KCWale integrates real-world services such as **Razorpay, Cloudinary, OLA Maps, Resend, MongoDB Atlas, and OTP authentication** to deliver a complete end-to-end food ordering experience.

---

## ✨ What Makes KCWale Different?

KCWale wasn't built as a simple CRUD project.

It was designed and deployed as a **real-world commerce application**, handling:

* 🔐 OTP-based authentication
* 🍔 Dynamic food menu
* 🔎 Menu search
* 🗂️ Category-based filtering
* 🛒 Persistent cart experience
* 💳 Online payments with Razorpay
* 📦 Complete order lifecycle
* 📍 Address management
* 🗺️ Location and map integration
* 📧 Transactional emails
* ☁️ Cloud-based image management
* 🛡️ Payment webhook verification
* 👤 Customer profiles
* 📱 Mobile-first responsive UI
* ⚡ Production deployment

---

## 🖥️ Core Experience

```text
                    ┌──────────────────────┐
                    │      KCWale.in       │
                    │   Food Ordering App  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        👤 Authentication   🍔 Menu          🛒 Cart
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                         💳 Checkout
                               │
                               ▼
                       💰 Razorpay
                               │
                               ▼
                         📦 Order
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
          📧 Email          📍 Address       🧾 History
```

---

# 🚀 Features

## 👤 Authentication

* OTP-based authentication
* Secure login flow
* User profile management
* Session-aware application experience

## 🍔 Menu

* Browse available food items
* Category-based filtering
* Search functionality
* Dynamic menu data
* Food images powered by Cloudinary
* Mobile-friendly menu experience

## 🛒 Cart

* Add items to cart
* Update quantities
* Remove items
* Automatic price calculations
* Seamless transition from cart to checkout

## 💳 Payments

Integrated with **Razorpay** for online payments.

The backend also implements **Razorpay webhook signature verification** to ensure payment events are validated server-side rather than blindly trusting client-side requests.

```text
Customer
   │
   ▼
Checkout
   │
   ▼
Razorpay
   │
   ▼
Payment
   │
   ▼
Webhook
   │
   ▼
Signature Verification
   │
   ▼
Order Confirmation
```

## 📦 Orders

Customers can:

* Place orders
* View order history
* Review previous purchases
* Track order information
* Access order details

## 📍 Address Management

* Add delivery addresses
* Update saved addresses
* Select an address during checkout
* Location/map integration through OLA Maps

## 📧 Email

Transactional emails are handled using **Resend**.

This replaced the earlier Nodemailer-based implementation with a more production-oriented email delivery setup.

## ☁️ Media

Food images and other uploaded assets are managed through **Cloudinary**, keeping media storage separate from the application server.

---

# 🧰 Tech Stack

## Frontend

| Technology   | Purpose                     |
| ------------ | --------------------------- |
| React        | UI development              |
| TypeScript   | Type safety                 |
| Vite         | Development & build tooling |
| Tailwind CSS | Styling                     |
| shadcn/ui    | UI components               |

## Backend

| Technology    | Purpose        |
| ------------- | -------------- |
| Node.js       | Runtime        |
| Express.js    | REST API       |
| MongoDB       | Database       |
| MongoDB Atlas | Cloud database |

## Services & Integrations

| Service      | Purpose                   |
| ------------ | ------------------------- |
| Razorpay     | Online payments           |
| Cloudinary   | Image/media storage       |
| OLA Maps API | Maps & location services  |
| Resend       | Transactional emails      |
| Vercel       | Frontend deployment       |
| Render       | Backend deployment        |
| UptimeRobot  | Backend uptime monitoring |

---

# 🏗️ Architecture

KCWale follows a traditional **client-server architecture** with a clear separation between the frontend, backend, database, and third-party services.

```text
                         ┌───────────────────┐
                         │     Customer      │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ React + TypeScript│
                         │   Vite + Tailwind │
                         └─────────┬─────────┘
                                   │
                              REST API
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Node.js + Express │
                         └─────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
       │ MongoDB Atlas│     │  Cloudinary  │     │  Razorpay    │
       └──────────────┘     └──────────────┘     └──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
              OLA Maps API                     Resend
```

---

# 📁 Project Structure

```text
KCWale/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── lib/
│       ├── services/
│       ├── context/
│       ├── types/
│       └── App.tsx
│
├── server/
│   ├── controllers/
│   │   ├── auth/
│   │   ├── menu/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── payment/
│   │   ├── address/
│   │   ├── maps/
│   │   └── admin/
│   │
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── server.js
│
├── .gitignore
├── README.md
└── package.json
```

> The exact directory names may vary depending on the current version of the repository.

---

# 🔌 API Domains

The backend is organized around separate business domains rather than putting everything into a single controller.

```text
/api/auth
/api/menu
/api/cart
/api/orders
/api/payment
/api/address
/api/maps
/api/admin
```

This keeps the backend modular and makes individual parts of the application easier to maintain and extend.

---

# 🔐 Security

Security was considered across the complete order and payment lifecycle.

### Authentication

OTP-based authentication reduces the dependency on traditional password-based login.

### Payment Verification

Razorpay webhook signatures are verified server-side before processing payment events.

```text
Incoming Webhook
       │
       ▼
Extract Signature
       │
       ▼
Verify Signature
       │
   ┌───┴───┐
   │       │
 Valid   Invalid
   │       │
   ▼       ▼
Process   Reject
```

### Environment Variables

Secrets and third-party credentials are kept outside the source code.

Example:

```env
MONGODB_URI=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
OLA_MAPS_API_KEY=
```

---

# 🌍 Deployment

KCWale uses a separated deployment architecture.

```text
                 Internet
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
      Vercel               Render
     Frontend              Backend
          │                   │
          │                   ▼
          │             MongoDB Atlas
          │
          ├──────── Razorpay
          ├──────── Cloudinary
          ├──────── OLA Maps
          └──────── Resend
```

### Frontend

Deployed using **Vercel**.

### Backend

Deployed using **Render**.

Because the backend runs on a hosting plan that can sleep after inactivity, an uptime monitor periodically hits the backend's health endpoint to keep the service responsive.

```text
UptimeRobot
     │
     │ periodic request
     ▼
/health
     │
     ▼
Render Backend
```

---

# ⚡ Getting Started

## 1. Clone the repository

```bash
git clone <repository-url>
cd KCWale
```

## 2. Install dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

---

## 3. Configure environment variables

Create the required `.env` files for the frontend and backend.

```env
# Database
MONGODB_URI=

# Authentication
OTP_SECRET=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend
RESEND_API_KEY=

# OLA Maps
OLA_MAPS_API_KEY=
```

Never commit real credentials to Git.

---

## 4. Start the backend

```bash
cd server
npm run dev
```

---

## 5. Start the frontend

```bash
cd client
npm run dev
```

The application should now be available through the Vite development server.

---

# 🧪 Development Workflow

A typical development workflow looks like:

```text
Feature Idea
     │
     ▼
Frontend UI
     │
     ▼
API Integration
     │
     ▼
Backend Controller
     │
     ▼
Business Logic
     │
     ▼
Database / External Service
     │
     ▼
Testing
     │
     ▼
Git Commit
     │
     ▼
Deployment
```

The project was built with real deployment and production concerns in mind rather than treating deployment as an afterthought.

---

# 📊 Real-World Scale

KCWale was built for an actual cloud-kitchen business operating in **Aligarh, Uttar Pradesh**.

At its peak, the platform was handling approximately:

> **~50 customers per day**

This gave the project practical requirements beyond a typical portfolio application, including payment reliability, order management, image hosting, transactional communication, deployment reliability, and mobile usability.

---

# 🧠 Engineering Highlights

Some of the more interesting engineering decisions behind KCWale:

### 🔄 Google Maps → OLA Maps

The project initially used Google Maps but was migrated to **OLA Maps API**, demonstrating the ability to replace external dependencies without redesigning the entire application.

### 📧 Nodemailer → Resend

Email delivery was migrated from Nodemailer to **Resend** for a more production-friendly transactional email setup.

### 💳 Secure Payment Webhooks

Payment confirmation isn't treated as a simple frontend callback.

Razorpay webhook signatures are validated on the backend before payment events are processed.

### ☁️ Cloudinary Media Pipeline

Images are stored through Cloudinary rather than being tied to the backend server's filesystem.

### 💤 Handling Sleeping Infrastructure

Since the backend was deployed on Render's limited hosting environment, a `/health` endpoint and UptimeRobot monitoring were used to reduce cold-start interruptions.

---

# 🎯 Product Flow

```text
                ┌──────────────┐
                │    Landing   │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Browse Menu  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Search/Filter│
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Add to Cart  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │   Checkout   │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │    Address   │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │   Razorpay   │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Order Placed │
                └──────┬───────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
        📧 Confirmation    📦 Order History
```

---

# 🛣️ Future Improvements

Potential next steps for KCWale include:

* [ ] Live order tracking
* [ ] Push notifications
* [ ] Automated order status notifications
* [ ] Advanced admin analytics
* [ ] Customer reviews & ratings
* [ ] Coupon and promotional system
* [ ] Loyalty / rewards system
* [ ] Improved inventory management
* [ ] Delivery partner dashboard
* [ ] PWA support
* [ ] Automated testing pipeline
* [ ] CI/CD workflow
* [ ] Advanced caching
* [ ] Better observability and logging

---

# 📸 Screenshots

> Add screenshots/GIFs of the actual application here.

Recommended showcase:

```text
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Landing     │  │      Menu       │  │      Cart       │
│                 │  │                 │  │                 │
│    🌙 KCWale    │  │ 🍔 Food Items   │  │ 🛒 Your Cart    │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Checkout     │  │     Orders      │  │     Profile     │
│                 │  │                 │  │                 │
│ 💳 Payment      │  │ 📦 Order #123   │  │ 👤 Account      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

# 🧩 Technologies at a Glance

```text
Frontend
├── React
├── TypeScript
├── Vite
├── Tailwind CSS
└── shadcn/ui

Backend
├── Node.js
├── Express.js
└── REST APIs

Database
└── MongoDB Atlas

Integrations
├── Razorpay
├── Cloudinary
├── OLA Maps
└── Resend

Infrastructure
├── Vercel
├── Render
└── UptimeRobot
```

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

```bash
# Fork the repository
# Create a feature branch

git checkout -b feature/amazing-feature

# Commit your changes

git commit -m "feat: add amazing feature"

# Push your branch

git push origin feature/amazing-feature
```

Then open a Pull Request.

---

# 📜 License

This project is currently maintained as a private/proprietary project for the KCWale cloud-kitchen business.

If you plan to open-source the repository, replace this section with the appropriate license.

---

# 👨‍💻 Built By

**Sahil Khan**

Computer Science & Engineering — AI/ML

Building things at the intersection of **software engineering, AI, and real-world products.**

---

<div align="center">

### 🌙 Night with KCWale

**Good food. Late nights. One app.**

⭐ If you found this project interesting, consider giving the repository a star.

</div>
