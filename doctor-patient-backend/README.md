# 🩺 Doctor Locator API

![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)
![Express](https://img.shields.io/badge/Express.js-Framework-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success)

## 📄 Description

A RESTful API backend allowing doctors to register clinic locations and patients to find nearby doctors. It uses MongoDB's geospatial queries and follows Google Maps API standards.

> 🛠 Built as part of **The Squirrel internship assignment**.

## 🚀 Features

- Doctor registration with **GeoJSON** location data
- Nearby doctor search using **MongoDB $near** queries
- Comprehensive **error handling middleware**
- Simple **health check endpoint**

## 🧰 Tech Stack

- **Node.js 20+**
- **Express.js**
- **MongoDB Atlas** (with 2dsphere index)
- **Mongoose ODM**

## 📚 API Endpoints

| Method | Endpoint                | Description                    |
|--------|-------------------------|--------------------------------|
| POST   | `/api/doctors`          | Register a new doctor          |
| GET    | `/api/doctors/nearby`   | Search doctors by location     |
| GET    | `/`                     | Health check                   |

## 🌐 Environment Variables

Create a `.env` file with the following:

```bash
MONGODB_URI=<your_mongodb_connection_string>
PORT=3000
```

## 🔁 Sample Requests

### ✅ Health Check

**GET /**

**Response:**
```json
{"status":"healthy","database":"connected"}
```

---

### ✅ Doctor Registration

**POST /api/doctors**  
**Body:**
```json
{
  "name": "Dr. Test",
  "specialty": "Cardiology",
  "lat": 12.97,
  "lng": 77.59
}
```

**Success Response:**
```json
{
  "message": "Doctor registered successfully",
  "doctor": {
    "name": "Dr. Test",
    "specialty": "Cardiology",
    "location": {
      "type": "Point",
      "coordinates": [77.59, 12.97]
    }
  }
}
```

---

### ✅ Nearby Doctor Search

**GET /api/doctors/nearby?lat=12.97&lng=77.59&maxDistance=5000**

**Response:**
```json
[
  {
    "name": "Dr. Test",
    "specialty": "Cardiology",
    "location": {
      "coordinates": [77.59, 12.97],
      "type": "Point"
    }
  }
]
```

---

### ❌ Error Case

**GET /api/doctors/nearby?maxDistance=1000**

**Response:**
```json
{
  "error": "Latitude and longitude are required"
}
```

## 🧾 Database Schema (Mongoose)

```javascript
{
  name: String,
  specialty: String,
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  timestamps: true
}
```

## 📊 Geospatial Query Flow

```
Client ➡️ API (/api/doctors/nearby) ➡️ MongoDB $near query ➡️ Filtered Doctors ➡️ Response
```

## ⚙️ Installation

```bash
# Clone the repository
git clone <repo-url>
cd doctor-locator-api

# Install dependencies
npm install

# Add your .env file
touch .env

# Start the server
npm start
```

## 📌 Assignment Requirements Met

- ✅ Google Maps compatible coordinates (lat/lng)
- ✅ MongoDB geospatial queries
- ✅ Basic CRUD operations supported
- ✅ Clean error handling with middleware

---

> 👨‍⚕️ Built with ❤️ for The Squirrel Internship Challenge

## ⏰ Cron Job for Maintenance Tasks

This API includes a **cron job that runs every 14 minutes** to maintain the database, optimized for Render’s free tier.


### 🔧 Tasks Automated

- 🧹 Remove doctors with **invalid GeoJSON coordinates**
- 📊 Log total number of doctors daily

### 📦 Setup

1. **Install node-cron**

```bash
npm install node-cron
```

2. **Create `cron.js` in project root**

```javascript
import cron from 'node-cron';
import Doctor from './models/Doctor.js';

// Daily at 3 AM IST
cron.schedule('0 3 * * *', async () => {
  try {
    const result = await Doctor.deleteMany({
      'location.coordinates': {
        $not: {
          $geoWithin: {
            $box: [[-180, -90], [180, 90]]
          }
        }
      }
    });

    console.log(`Cleaned ${result.deletedCount} invalid doctor entries`);

    const totalDoctors = await Doctor.countDocuments();
    console.log(`Daily backup: ${totalDoctors} doctors in database`);
  } catch (err) {
    console.error('Cron job failed:', err);
  }
}, {
  timezone: "Asia/Kolkata"
});
```

3. **Import in `server.js`**

```javascript
import './cron.js'; // After DB connection
```

### 🛠 Additional Cron Ideas

- **Weekly Backups** – Every Sunday at 2 AM
```javascript
cron.schedule('0 2 * * 0', () => {
  // Trigger backup script or notification
});
```

- **Demo Data Cleanup** – Keep last 100 test doctors in development
```javascript
if (process.env.NODE_ENV === 'development') {
  await Doctor.find().sort({ createdAt: -1 }).skip(100).deleteMany();
}
```

### ✅ Test & Verify

- Change schedule to `* * * * *` for testing (runs every minute)
- Check logs for:
```
Cleaned 0 invalid doctor entries
Daily backup: 2 doctors in database
```

---
