# **Local Guide Platform – Backend**

A scalable backend service that connects **tourists** with **local guides**, enabling authentic travel experiences through bookings, reviews, and secure payments.
Built with **Node.js**, **Express**, **Prisma**, and **PostgreSQL**, the platform includes role-based access, tour listings, payment processing, and admin controls.

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
10. [Payment Flow](#payment-flow)
11. [Troubleshooting](#troubleshooting)
12. [Contributors](#contributors)
13. [License](#license)

---

## **Overview**

The Local Guide Platform backend provides a complete API for:

* User authentication & role-based access
* Guide-managed tour listings
* Booking workflow (request → approval → payment → completion)
* Secure payment handling with Stripe
* Tourist reviews & ratings
* Admin moderation and platform management

---

## **Features**

### **1. User Management**

* Roles: **Tourist**, **Guide**, **Admin**
* JWT Authentication
* User registration & login
* Profile management + image upload (Cloudinary/S3)
* Account status control (Admin)

### **2. Tour Listings**

* Guides create/manage listings
* Images, itinerary, price, duration, category
* Public listing search/filter
* Listing status updates

### **3. Booking System**

* Tourists request bookings
* Guides/Admin approve or reject
* Status lifecycle:
  **Pending → Confirmed → Completed / Cancelled**

### **4. Payments (Stripe)**

* Payment sessions for bookings
* Status tracking: **Pending / Success / Failed**
* Auto-confirm booking on successful payment

### **5. Reviews & Ratings**

* Tourists review guides after completing a tour
* Ratings linked to listings & guides

### **6. Admin Controls**

* Full user management
* Booking supervision
* Listing moderation

---

## **Tech Stack**

| Layer          | Technology                 |
| -------------- | -------------------------- |
| Backend        | Node.js, Express           |
| ORM            | Prisma (PostgreSQL)        |
| Database       | PostgreSQL                 |
| Authentication | JWT                        |
| File Storage   | Cloudinary or AWS S3       |
| Payments       | Stripe                     |
| Config         | .env environment variables |
| Validation     | Zod schemas                |
| Uploads        | Multer                     |

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
│   │
│   ├── config
│   ├── constants
│   ├── type
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── render-build.sh
├── tsconfig.json
└── vercel.json
```

---

## **Installation**

### **1. Clone the repo**

```bash
git clone https://github.com/your-username/local-guide-backend.git
cd local-guide-backend
```

### **2. Install dependencies**

```bash
npm install
```

### **3. Setup Prisma**

```bash
npx prisma generate
npx prisma migrate dev
```

### **4. Start the server**

```bash
npm run dev
```

---

## **Environment Variables**

Create a `.env` file:

```
DATABASE_URL="postgres://..."
JWT_SECRET="your_jwt_secret"
STRIPE_SECRET_KEY="your_stripe_key"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
PORT=5000
```

---

## **Scripts**

| Script               | Description                   |
| -------------------- | ----------------------------- |
| `npm run dev`        | Start dev server with nodemon |
| `npm run build`      | Compile TypeScript            |
| `npm start`          | Run production build          |
| `prisma migrate dev` | Apply local migration         |
| `prisma studio`      | Open Prisma UI                |

---

## **API Overview**

### **Auth**

```
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

### **Users**

```
GET    /users/         (Admin)
GET    /users/:id
PATCH  /users/profile
PATCH  /users/status/:id (Admin)
DELETE /users/:id       (Admin)
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

### **Payments**

```
POST /payments/booking
```

### **Reviews**

```
POST /reviews/
GET  /reviews/
```

---

## **Database & Prisma**

The application uses **Prisma ORM** with a modular schema:

* `user.prisma` – roles, profiles, status
* `listing.prisma` – tour data
* `booking.prisma` – booking workflow
* `payment.prisma` – Stripe integrations
* `review.prisma` – ratings & comments

Run migrations:

```bash
npx prisma migrate dev
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## **Payment Flow**

1. Tourist creates a booking → **Pending**
2. Tourist initiates payment via Stripe session
3. Stripe webhook updates payment status
4. Booking becomes **Confirmed** on successful payment
5. Guide can later mark it **Completed**

---

## **Troubleshooting**

| Issue                | Possible Fix                         |
| -------------------- | ------------------------------------ |
| Prisma errors        | Check `DATABASE_URL` in `.env`       |
| JWT not working      | Confirm `JWT_SECRET` exists          |
| File upload failures | Verify Cloudinary or AWS credentials |
| Stripe errors        | Validate your secret key             |

---

## **Contributors**

* **Istiak Ahamed** – Backend Developer