# **Pathfinder – Local Guide Platform (Backend)**

A scalable backend service that connects **tourists** with **local guides**, enabling authentic travel experiences through bookings, reviews, and secure payments.
Built with **Node.js**, **Express**, **Prisma**, and **PostgreSQL**, Pathfinder provides a complete backend API for tourism services.

🔗 **Live Website:** [https://local-jet.vercel.app](https://local-jet.vercel.app)
🚀 **Tech:** Node.js, Express, Prisma, PostgreSQL, JWT, SSLCommerz

---

## **Table of Contents**

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

## **Overview**

Pathfinder backend provides robust APIs for:

* User authentication & role-based permissions
* Guide-managed tour listings
* Booking workflow (Request → Approval → Payment → Completion)
* Secure online payments using **SSLCommerz**
* Reviews & ratings
* Admin oversight for moderation and platform integrity

---

## **Features**

### **1. User Management**

* Roles: **Tourist**, **Guide**, **Admin**
* JWT Authentication
* Registration, login, logout
* Profile management + image uploads (Cloudinary/S3)
* Admin: account activation, deactivation

### **2. Tour Listings**

* Guides create/manage tours
* Images, price, duration, itinerary
* Public view + filtering
* Admin/Guide status management

### **3. Booking System**

* Tourists request bookings
* Guides/Admin accept or reject
* Status lifecycle:

  **Pending → Approved → Paid → Completed / Cancelled**

### **4. Payments (SSLCommerz)**

* Fully integrated **SSLCommerz Hosted Payment Gateway**
* Auto-update payment status
* Secure validation callback
* Auto-confirm booking on success

### **5. Reviews**

* Tourists leave ratings & comments after tour completion

### **6. Admin Controls**

* Full user management
* Platform moderation
* Handle disputes/bookings

---

## **Tech Stack**

| Layer           | Technology          |
| --------------- | ------------------- |
| Backend         | Node.js, Express    |
| ORM             | Prisma              |
| Database        | PostgreSQL          |
| Authentication  | JWT                 |
| File Upload     | Cloudinary / AWS S3 |
| Payment Gateway | **SSLCommerz**      |
| Validation      | Zod                 |
| Uploads         | Multer              |

---

## **Project Structure**

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

## **Installation**

### 1️⃣ Clone the repo

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

### 4️⃣ Start development server

```bash
npm run dev
```

---

## **Environment Variables**

Create a `.env` file:

```
DATABASE_URL="postgres://..."
JWT_SECRET="your_jwt_secret"

# SSLCommerz keys
SSLC_STORE_ID="your_store_id"
SSLC_STORE_PASSWORD="your_store_password"
SSLC_MODE="live"   # or "sandbox"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

PORT=5000
```

---

## **Scripts**

| Script               | Description           |
| -------------------- | --------------------- |
| `npm run dev`        | Start dev server      |
| `npm run build`      | Build TypeScript      |
| `npm start`          | Run production server |
| `prisma migrate dev` | Run DB migrations     |
| `prisma studio`      | GUI for database      |

---

## **API Overview**

### **Auth Routes**

```
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout
```

### **Users**

```
GET    /users/           (Admin)
GET    /users/:id
PATCH  /users/profile
PATCH  /users/status/:id (Admin)
DELETE /users/:id        (Admin)
```

### **Listings**

```
POST   /listings/
GET    /listings/
GET    /listings/:id
PATCH  /listings/:id
PATCH  /listings/status/:id
DELETE /listings/:id
```

### **Bookings**

```
POST   /bookings/
GET    /bookings/me
GET    /bookings/
GET    /bookings/guide/my
PATCH  /bookings/:id
DELETE /bookings/:id
```

### **Payments (SSLCommerz)**

```
POST /payments/booking
POST /payments/success
POST /payments/fail
POST /payments/cancel
POST /payments/validate-payment
```

### **Reviews**

```
POST /reviews/
GET  /reviews/
```

---

## **Database & Prisma**

Modular schema includes:

* `user.prisma` – roles & profiles
* `listing.prisma` – tour details
* `booking.prisma` – booking workflow
* `payment.prisma` – SSLCommerz metadata
* `review.prisma` – feedback system

Run migrations:

```bash
npx prisma migrate dev
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## **Payment Flow (SSLCommerz)**

1. Tourist requests booking → status **Pending**
2. Tourist starts SSLCommerz payment via `/payments/booking`
3. SSLCommerz redirects to:

   * `/payments/success`
   * `/payments/fail`
   * `/payments/cancel`
4. Server validates payment with `/payments/validate-payment`
5. On success:

   * Payment marked **Paid**
   * Booking moves to **Confirmed**
6. Guide completes tour → booking becomes **Completed**

---

## **Troubleshooting**

| Issue                | Fix                                               |
| -------------------- | ------------------------------------------------- |
| Prisma errors        | Check `DATABASE_URL`                              |
| JWT errors           | Verify `JWT_SECRET`                               |
| Upload issues        | Confirm Cloudinary keys                           |
| Payment fail         | Verify Store ID & Password                        |
| Callback not working | Confirm Vercel/Server URL in SSLCommerz dashboard |

---

## **Contributors**

* **Istiak Ahamed** – Backend Developer