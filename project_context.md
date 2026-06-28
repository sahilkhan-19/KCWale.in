Overview

KCWALE is a production-ready, mobile-first MERN stack online food ordering platform built for KC Kitchen.

The project is currently in its final production phase and is being prepared for deployment.

Tech Stack
Frontend
React
TypeScript
Tailwind CSS
Vite
Backend
Node.js
Express.js
Database
MongoDB Atlas
Authentication
OTP Login using Gmail SMTP (Nodemailer)
Storage
Cloudinary
Maps
OLA Maps (Autocomplete)
Payments
Razorpay
Project Structure

/client

Customer-facing React application
Mobile-first UI
Checkout
Cart
Authentication
Profile
Orders

/server

Express REST API
Controllers
Models
Routes
Middleware
Utilities
Authentication
Payment verification
Email services
Implemented Features
Customer
OTP Authentication
Browse Menu
Category Filtering
Product Search
Product Details
Cart
Checkout
Order Placement
Address Management
Customer Profile
Order History
Google Forms Contact Form
Payments
Cash on Delivery
Razorpay Online Payments
Backend Signature Verification
Duplicate Payment Prevention
Admin
Admin Dashboard
Product Management
Order Management
Customer Management
Order Details
Notifications
Admin receives email notification for every successful order.
Existing Gmail SMTP transporter is reused.
Notification recipient is configured using ADMIN_EMAIL in .env.
External Services
MongoDB Atlas
Cloudinary
Razorpay
Gmail SMTP
OLA Maps
Google Forms
Business Rules
Mobile-first UI is the primary design target.
KCWALE currently serves a single restaurant (KC Kitchen).
No free delivery.
Delivery charges are calculated by the backend.
Manual address entry is required.
OLA Maps is used only for address autocomplete/search.
Browser geolocation has intentionally been removed.
Customer order history is retained.
Admin role is assigned manually in MongoDB.
Google Forms is used for the "Get in Touch" feature.
Environment Variables

All sensitive credentials are stored in .env.

Includes:

MongoDB
JWT
SMTP
ADMIN_EMAIL
Razorpay
Cloudinary
OLA Maps

Never hardcode secrets or credentials.

Current Status
Completed
OTP Authentication
Menu System
Search
Cart
Checkout
Customer Profile
Order History
Address Management
COD Orders
Razorpay Payments
Payment Verification
Admin Dashboard
Admin Email Notifications
Google Forms Contact Form
Cloudinary Integration
OLA Maps Integration
Remaining
Final production audit
Deployment
Domain verification
Production monitoring
Coding Guidelines
Reuse existing utilities whenever possible.
Do not duplicate business logic.
Do not duplicate SMTP transporter configuration.
Do not duplicate Razorpay configuration.
Keep controllers clean.
Keep reusable logic inside utilities.
Preserve current architecture.
Maintain backward compatibility.
Verified Working Features

These features have already been implemented and should not be broken.

OTP Authentication
Customer Login
Cart
Checkout
COD Orders
Razorpay Orders
Payment Verification
Admin Email Notifications
Customer Order History
Customer Profile
Cloudinary Uploads
OLA Maps Autocomplete
Google Forms Contact Form
Important Notes
This project is in the final production phase.
Stability is preferred over unnecessary refactoring.
Avoid introducing breaking changes.
Existing working features should remain untouched unless a genuine issue is discovered.
Always analyze the complete codebase before suggesting modifications.
Never create duplicate implementations when an existing utility already exists.
AI Instructions

Before making any changes:

Analyze the complete codebase.
Read this PROJECT_CONTEXT.md.
Read walkthrough.md and task.md if present.
Understand the existing architecture before proposing changes.
Preserve existing functionality.
Avoid unnecessary refactoring.
Do not replace working implementations without a valid technical reason.
Follow existing project patterns and conventions.
Treat this project as production software.
Prioritize correctness, security, maintainability, and backward compatibility over code style changes.
Current Objective

The current objective is to perform a final production-readiness audit and deploy KCWALE.

Future changes should prioritize:

Stability
Security
Performance
Reliability
Production readiness

over introducing new features or large architectural changes.

🧠 Recent Production Fixes (June 2026)
🔴 Delivery System Overhaul (Blocker Fix)
Updated Files:
server/src/utils/location.js
server/src/controllers/orders.controller.js
server/src/controllers/payment.controller.js
Final Delivery Pricing Logic:
Distance	Charge
0 – 2 km	₹20
2 – 4 km	₹35
4 – 6 km	₹50
6 – 8 km	₹70
8 – 15 km	₹90 + ₹10/km
> 15 km	❌ Rejected
System Changes:
SERVICE_RADIUS_LIMIT set to 15km
Hard rejection for orders beyond 15km
Unified pricing logic across:
Order creation
Payment validation
Delivery calculation utility
calculateDeliveryCharge() returns -1 for invalid distance
🔴 OTP Security Hardening
File:
server/src/controllers/auth.controller.js
Changes:
Removed all development OTP logs
Eliminated [DEV] OTP console leakage
Production-safe authentication flow ensured
🔴 Debug Logging Cleanup
File:
server/src/controllers/orders.controller.js
Changes:
Removed all [DEVELOPMENT ONLY] coordinate logs
Cleaned GPS debugging outputs from production flow
🟠 CORS Security Hardening
Files:
server/src/app.js
server/.env.example
Changes:

CORS restricted to:

process.env.CLIENT_URL || "https://kcwale.in"
credentials: true enabled
Added CLIENT_URL to environment template
Required Production Env:
CLIENT_URL=https://kcwale.in
⚙️ Deployment Readiness Status
Backend is now:
Production-safe (no debug/OTP leaks)
Geo-restricted delivery enforced
Consistent pricing logic across services
Hardened CORS policy
Fully environment-configurable
Settings persistent in MongoDB database (resilient to ephemeral environments)
Protected against brute-force/spam via Express rate limiters on OTP/Login endpoints
Ready for final deployment phase