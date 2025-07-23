import express from 'express';
import {
  registerDoctor,
  findNearbyDoctors
} from '../controllers/doctors.js';

const router = express.Router();

router.post('/', registerDoctor);
router.get('/nearby', findNearbyDoctors);

export default router;