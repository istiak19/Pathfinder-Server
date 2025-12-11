# 📍 **Pathfinder – Local Guide Platform (Backend)**

A scalable backend service that connects **tourists** with **local guides**, enabling authentic travel experiences through listings, bookings, reviews, and secure payments.
Built using **Node.js**, **Express**, **PostgreSQL**, **Prisma**, and **SSLCommerz**.

🔗 **Live Website:** [https://local-jet.vercel.app](https://local-jet.vercel.app)
🚀 **Tech:** Node.js • Express • Prisma • PostgreSQL • JWT • Multer • Cloudinary/S3 • SSLCommerz

---

## 📌 **Table of Contents**

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Scripts](#scripts)
8. [API Overview](#api-overview)
9. [Database & Prisma](#database--prisma)
10. [Payment Flow (SSLCommerz)](#payment-flow-sslcommerz)
11. [Troubleshooting](#troubleshooting)
12. [Contributors](#contributors)
13. [License](#license)

---

## 🔎 **Overview**

Pathfinder’s backend provides a robust, secure, and scalable API for managing:

* User authentication & roles
* Guide-managed tour listings
* Tourist bookings and workflow
* Secure online payments using **SSLCommerz**
* Review & rating system
* Admin tools for full platform moderation

The backend is designed with modular controllers, middleware, validation, and Prisma ORM for clean and maintainable architecture.

---

## ⭐ **Features**

### **1. User Management**

* Roles: **Tourist**, **Guide**, **Admin**
* JWT authentication
* Registration, login, logout
* Profile update with image upload (Cloudinary/S3)
* Admin controls: activate, deactivate, change role

### **2. Tour Listings**

* Created & managed by guides/admin
* Photo upload support
* Public listing view with filtering
* Listing status management

### **3. Booking System**

* Tourists request bookings
* Guides/Admin approve or reject
* Booking lifecycle:

  **Pending → Approved → Paid → Completed / Cancelled**

### **4. Secure Payments (SSLCommerz)**

* Full hosted payment gateway integration
* Secure callback validation
* Automatic booking confirmation after successful payment

### **5. Review System**

* Tourists leave ratings & comments after tour completion

### **6. Admin Tools**

* Manage all users
* Oversee listings & bookings
* Handle disputes

---

## 🧰 **Tech Stack**

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Backend         | Node.js, Express            |
| ORM             | Prisma                      |
| Database        | PostgreSQL                  |
| Authentication  | JWT                         |
| Validation      | Zod                         |
| Uploads         | Multer + Cloudinary/AWS S3  |
| Payment Gateway | SSLCommerz                  |
| Deployment      | Vercel / Other Node Hosting |

---

## 📁 **Project Structure**

```
LOCAL-GUIDE-SERVER
├── prisma
│   └── schema
│       ├── payment.prisma
│       ├── review.prisma
│       ├── schema.prisma
│       └── user.prisma
│
├── src
│   ├── app
│   │   ├── errors
│   │   ├── helpers
│   │   ├── middlewares
│   │   ├── modules
│   │   ├── routes
│   │   │   └── index.ts
│   │   ├── shared
│   │   └── utils
│   ├── config
│   ├── constants
│   ├── type
│   ├── app.ts
│   └── server.ts
│
├── .env
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## 🛠️ **Installation**

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/local-guide-backend.git
cd local-guide-backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

### 4️⃣ Run development server

```bash
npm run dev
```

---

## 🔐 **Environment Variables**

Create a `.env` file with:

```
DATABASE_URL="postgres://..."
JWT_SECRET="your_jwt_secret"

# SSLCommerz keys
SSLC_STORE_ID="your_store_id"
SSLC_STORE_PASSWORD="your_store_password"
SSLC_MODE="live"   # or "sandbox"

# File uploads
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

PORT=5000
```

---

## 📜 **Scripts**

| Script               | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Build TypeScript         |
| `npm start`          | Start production server  |
| `prisma migrate dev` | Run database migrations  |
| `prisma studio`      | Visual DB viewer         |

---

# 🧩 **API Overview**

Below are the **exact routes** from your codebase.

---

## 🔐 **Auth Routes**

```
POST /auth/login
POST /auth/logout
GET  /auth/me
```

---

## 👥 **User Routes**

```
POST   /users/register
GET    /users/                       (Admin)
GET    /users/:id                    (Admin, Guide, Tourist)
PATCH  /users/profile                (Admin, Guide, Tourist) [file upload]
PATCH  /users/status/:id             (Admin)
PATCH  /users/role/:id               (Admin)
DELETE /users/:id                    (Admin)
```

---

## 🗺️ **Listing Routes**

```
POST   /listings/                    (Admin, Guide) [file upload]
GET    /listings/                    (Public)
GET    /listings/guide-listings      (Guide)
GET    /listings/:id                 (Admin, Guide, Tourist)
PATCH  /listings/:id                 (Guide) [file upload]
PATCH  /listings/status/:id          (Guide, Admin)
DELETE /listings/:id                 (Guide)
```

---

## 📅 **Booking Routes**

```
POST   /bookings/                    (Tourist)
GET    /bookings/me                  (Tourist)
GET    /bookings/                    (Admin)
GET    /bookings/guide/my            (Guide)
GET    /bookings/me/:id              (Tourist)
PATCH  /bookings/:id                 (Guide, Admin)
DELETE /bookings/:id                 (Tourist, Admin)
```

---

## 💳 **Payment Routes (SSLCommerz)**

```
POST /payments/booking               (Tourist)
POST /payments/success               (Callback)
POST /payments/fail                  (Callback)
POST /payments/cancel                (Callback)
POST /payments/validate-payment      (Callback)
```

---

## ⭐ **Review Routes**

```
POST /reviews/                       (Tourist)
GET  /reviews/                       (Public)
```

---

## 📊 **Meta Routes**

```
GET /meta/                           (Admin, Guide, Tourist)
```

---

## 🗄️ **Database & Prisma**

Your Prisma schema is modularized:

* `user.prisma` – accounts, profiles, roles
* `listing.prisma` – tour listings
* `booking.prisma` – booking workflow
* `review.prisma` – rating system
* `payment.prisma` – SSLCommerz metadata

### Commands

Run migrations:

```bash
npx prisma migrate dev
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## 💰 **Payment Flow (SSLCommerz)**

1. Tourist requests booking → **Pending**
2. Tourist initiates payment via `/payments/booking`
3. SSLCommerz redirects to:

   * `/payments/success`
   * `/payments/fail`
   * `/payments/cancel`
4. Backend validates at `/payments/validate-payment`
5. If successful:

   * Payment → **Paid**
   * Booking → **Confirmed**
6. After completion by guide → **Completed**

---

## 🧯 **Troubleshooting**

| Issue                           | Solution                     |
| ------------------------------- | ---------------------------- |
| Prisma errors                   | Check `DATABASE_URL`         |
| JWT failed                      | Verify `JWT_SECRET`          |
| File upload failing             | Check Cloudinary credentials |
| Payment mismatch                | Validate Store ID & Password |
| SSLCommerz callback not working | Verify base URL settings     |

---

## 👤 **Contributors**

* **Istiak Ahamed** – Backend Developer
