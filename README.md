# GOorganic

GOorganic is a full-stack e-commerce and subscription marketplace platform built for organic and health-focused products. The project is organized as a monorepo with a Node.js/Express backend and a Next.js frontend, supporting customer shopping, vendor management, admin control, subscription boxes, Stripe payments, and real-time chat.

## Project Overview

This application allows:

- Customers to browse and purchase organic products
- Vendors to manage their products, orders, and payouts
- Admins to manage users, categories, plans, disputes, and reviews
- Subscription-based product box purchases
- Payment processing with Stripe
- Real-time communication via Socket.IO
- Email notifications and admin/user alerts
- File upload and media management using Cloudinary

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Stripe React components
- Socket.IO client
- Recharts for dashboard analytics

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Stripe API
- Cloudinary for media uploads
- Nodemailer for email notifications
- Socket.IO for real-time features
- Node-cron for scheduled jobs

## Monorepo Structure

```bash
.
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── seeder.js
├── frontend/
│   ├── app/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── README.md
└── package.json (if added in future)
```

## Features

### Customer Features
- User registration, login, and email verification
- Product catalog browsing and filtering
- Cart and checkout flow
- Order tracking and invoice generation
- Review and rating system
- Loyalty transactions and rewards
- Notification center
- Support and dispute management
- Chat with vendors/admins

### Vendor Features
- Vendor approval workflow
- Product management
- Order monitoring
- Sales tracking and dashboard insights
- Customer review handling

### Admin Features
- User and vendor management
- Subscription plan configuration
- Category control
- Product moderation
- Order and dispute oversight
- Notifications and system communication

### Subscription System
- Box subscriptions and recurring plans
- Subscription order automation
- Subscription scheduling and billing logic

## Prerequisites

Before running the project, ensure you have:

- Node.js 18+ or newer
- npm or yarn
- MongoDB Atlas or a local MongoDB instance
- Cloudinary account
- Stripe account
- Gmail SMTP or an email provider for outgoing emails

## Environment Variables

Create a `.env` file inside the `backend` folder with the required configuration:

```env
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
ADMIN_EMAIL=admin@example.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
```

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd goorganic
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Running the Project

### Start the backend

```bash
cd backend
npm run dev
```

The backend server runs on:

```bash
http://localhost:5000
```

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend app runs on:

```bash
http://localhost:3000
```

## Production Build

### Frontend production build

```bash
cd frontend
npm run build
npm run start
```

### Backend production run

```bash
cd backend
npm start
```

## Available Scripts

### Backend
- `npm run dev` - Run the API with nodemon
- `npm start` - Run the production server

### Frontend
- `npm run dev` - Run the Next.js app in development mode
- `npm run build` - Create a production build
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint checks

## Notes

- The backend exposes APIs under `/api/v1/...`
- CORS is configured for the frontend URL declared in the backend `.env`
- Socket.IO is initialized from the backend and used for chat and real-time updates
- The project includes scheduled jobs for subscription and order lifecycle tasks

## Contact

For project questions or deployment support, contact the project maintainer or team repository owner.
