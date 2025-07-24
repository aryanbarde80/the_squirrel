import cron from 'node-cron';
import Doctor from './models/Doctor.js';

// Schedule: Runs every 14 minutes (compatible with Render's free tier)
cron.schedule('*/14 * * * *', async () => {
  try {
    console.log('[CRON] 🔄 Starting maintenance cycle...');

    // --- STEP 1: Identify Doctors with Invalid Coordinates ---
    // Latitude must be between -90 and 90
    // Longitude must be between -180 and 180
    const invalidDoctors = await Doctor.find({
      $or: [
        { 'location.coordinates.0': { $not: { $gte: -180, $lte: 180 } } },
        { 'location.coordinates.1': { $not: { $gte: -90, $lte: 90 } } }
      ]
    }).limit(10); // Limit check to 10 entries for resource efficiency

    // --- STEP 2: Remove Invalid Doctor Entries ---
    if (invalidDoctors.length > 0) {
      const result = await Doctor.deleteMany({
        _id: { $in: invalidDoctors.map(doc => doc._id) }
      });
      console.log(`[CRON] 🧹 Removed ${result.deletedCount} invalid doctor entries.`);
    }

    // --- STEP 3: Sample Lightweight Statistics ---
    const sampleStats = {
      time: new Date().toISOString(),
      totalDoctors: await Doctor.countDocuments(),
      sampleSpecialties: await Doctor.aggregate([
        { $sample: { size: 5 } },
        { $group: { _id: "$specialty" } }
      ])
    };

    console.log('[CRON] 📊 Maintenance stats:', sampleStats);
    
  } catch (err) {
    console.error('[CRON ERROR] ❌', err.message);
  }
});
