import express from 'express';
import dotenv from 'dotenv';
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
import { startScheduler } from './utils/scheduler.js';

// Configure dotenv
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());

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

// Test Route
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// Define Port
const PORT = process.env.PORT || 5000;

startScheduler();

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});