import cron from 'node-cron';
import Doctor from './models/Doctor.js';

// Runs every 14 minutes (Render free tier compatible)
cron.schedule('*/14 * * * *', async () => {
  try {
    console.log('[CRON] Starting maintenance cycle...');
    
    // 1. Quick validation check
    const invalidDoctors = await Doctor.find({
      $or: [
        { 'location.coordinates.0': { $not: { $gte: -180, $lte: 180 } } },
        { 'location.coordinates.1': { $not: { $gte: -90, $lte: 90 } } }
      ]
    }).limit(10); // Check only first 10 to save resources

    if (invalidDoctors.length > 0) {
      const result = await Doctor.deleteMany({
        _id: { $in: invalidDoctors.map(doc => doc._id) }
      });
      console.log(`[CRON] Removed ${result.deletedCount} invalid entries`);
    }

    // 2. Lightweight stats (sampled)
    const sampleStats = {
      time: new Date().toISOString(),
      totalDoctors: await Doctor.countDocuments(),
      sampleSpecialties: await Doctor.aggregate([
        { $sample: { size: 5 } },
        { $group: { _id: "$specialty" } }
      ])
    };
    
    console.log('[CRON] Maintenance stats:', sampleStats);

  } catch (err) {
    console.error('[CRON ERROR]', err.message);
  }
});