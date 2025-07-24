/**
 * Calculate distance between two coordinates in meters
 * (Haversine formula implementation)
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const latRad1 = lat1 * Math.PI/180;
  const latRad2 = lat2 * Math.PI/180;
  const deltaLat = (lat2-lat1) * Math.PI/180;
  const deltaLon = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(latRad1) * Math.cos(latRad2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

/**
 * Validate if coordinates are within Earth's bounds
 */
export const isValidLocation = (lat, lng) => (
  lat >= -90 && lat <= 90 && 
  lng >= -180 && lng <= 180
);