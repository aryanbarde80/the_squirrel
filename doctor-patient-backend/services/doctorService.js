import Doctor from '../models/Doctor.js';

// Pure database operations (No req/res)
export const createDoctor = async ({ name, specialty, address, lng, lat }) => {
  return await Doctor.create({
    name,
    specialty,
    address,
    location: {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    }
  });
};

export const searchNearby = async ({ lng, lat, maxDistance }) => {
  return await Doctor.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(maxDistance)
      }
    }
  });
};