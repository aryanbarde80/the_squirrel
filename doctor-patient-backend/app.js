import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import doctorRoutes from './routes/doctorRoute.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://the-squirrel-assignent-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

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
