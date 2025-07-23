import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import doctorRoutes from './routes/doctorRoute.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/doctors', doctorRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// DB Connection
connectDB();

export default app;