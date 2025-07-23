require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Validate environment variables
if (!process.env.MONGODB_URI || !process.env.PORT) {
  console.error('Error: MONGODB_URI and PORT must be defined in .env file');
  process.exit(1);
}

// Modern MongoDB connection (removed deprecated options)
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

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Doctor Locator API is running');
});

// Doctor registration endpoint
app.post('/api/doctors', async (req, res) => {
  try {
    const { name, specialty, address, lat, lng } = req.body;

    // Input validation
    if (!name || !specialty || !address || lat == null || lng == null) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'specialty', 'address', 'lat', 'lng']
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Coordinates must be numbers' });
    }

    // Validate geographic bounds
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      return res.status(400).json({ 
        error: 'Invalid coordinates',
        valid_ranges: {
          latitude: '-90 to 90',
          longitude: '-180 to 180'
        }
      });
    }

    const doctor = new Doctor({
      name,
      specialty,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    });

    await doctor.save();
    res.status(201).json({
      message: 'Doctor registered successfully',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        location: doctor.location
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      error: 'Failed to register doctor',
      details: err.message 
    });
  }
});

// Doctor search endpoint
app.get('/api/doctors/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;
    
    // Validate parameters
    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Missing coordinates',
        example: '/api/doctors/nearby?lat=12.34&lng=56.78'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distance = Math.min(parseInt(maxDistance), 10000); // Max 10km
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
      return res.status(400).json({ error: 'Invalid numeric parameters' });
    }

    const doctors = await Doctor.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: distance
        }
      }
    }).select('-__v').limit(50); // Exclude version key and limit results

    res.json({
      count: doctors.length,
      searchLocation: { latitude, longitude },
      maxDistance: distance,
      doctors
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ 
      error: 'Failed to search doctors',
      details: err.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    requestId: req.id // Consider adding request ID tracking
  });
});

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});