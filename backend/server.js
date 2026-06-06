import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cookieParser from 'cookie-parser';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import orderReviewRoutes from './routes/orderReviewRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import subscriptionBoxRoutes from './routes/subscriptionBoxRoutes.js';
import boxSubscriptionRoutes from './routes/boxSubscriptionRoutes.js';
import { startScheduler } from './utils/scheduler.js';
import { initializeSocket } from './utils/socketHandlers.js';

// Configure dotenv
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser());

// Main Routes  
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/faqs', faqRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/reviews', orderReviewRoutes);
app.use('/api/v1/disputes', disputeRoutes);
app.use('/api/v1/subscription-boxes', subscriptionBoxRoutes);
app.use('/api/v1/box-subscriptions', boxSubscriptionRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.message === 'aborted') {
    return res.status(400).json({ message: 'Request was aborted' });
  }
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Define Port
const PORT = process.env.PORT || 5000;

startScheduler();

// Start Server
const server = httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

initializeSocket(httpServer);

// Increase server timeout for large file uploads
server.timeout = 300000; // 5 minutes