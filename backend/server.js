import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js'; // 1. Import the routes

// Configure dotenv
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());

// Main Routes
app.use('/api/v1/users', userRoutes); // 2. Use the routes

// Test Route
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// Define Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});