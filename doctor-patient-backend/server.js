require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend-domain.com' : '*' }));
app.use(express.json());

// Validate environment variables
if (!process.env.MONGODB_URI || !process.env.PORT) {
  console.error('Error: MONGODB_URI and PORT must be defined in .env file');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Doctor Model
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  }
}, { timestamps: true });

doctorSchema.index({ location: '2dsphere' });
const Doctor = mongoose.model('Doctor', doctorSchema);

// Routes
app.post('/api/doctors', async (req, res) => {
  try {
    const { name, specialty, address, lat, lng } = req.body;

    // Input validation
    if (!name || !specialty || !address || lat == null || lng == null) {
      return res.status(400).json({ error: 'All fields (name, specialty, address, lat, lng) are required' });
    }
    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    const doctor = new Doctor({
      name,
      specialty,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      }
    });

    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});