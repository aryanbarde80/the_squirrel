import { createDoctor, searchNearby } from '../services/doctorService.js';

export const registerDoctor = async (req, res) => {
  try {
    const { name, specialty, address, lat, lng } = req.body;
    
    if (!name || !specialty || !lat || !lng) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const doctor = await createDoctor({ name, specialty, address, lng, lat });
    res.status(201).json(doctor);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const findNearbyDoctors = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Coordinates required' });
    }

    const doctors = await searchNearby({ lng, lat, maxDistance });
    res.json(doctors);

  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
};