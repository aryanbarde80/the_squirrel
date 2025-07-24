import express from 'express';
import {
  registerDoctor,
  findNearbyDoctors
} from '../controllers/doctors.js';

const router = express.Router();

router.post('/', registerDoctor);
router.get('/nearby', findNearbyDoctors);

// Placeholder for future: update doctor details
// router.put('/:id', updateDoctor); // To be implemented later

export default router;
