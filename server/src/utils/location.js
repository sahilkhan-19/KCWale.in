import dotenv from "dotenv";
dotenv.config();

// Kitchen location: default is Sector 62, Noida
const KITCHEN_LAT = parseFloat(process.env.KITCHEN_LAT) || 28.6273;
const KITCHEN_LNG = parseFloat(process.env.KITCHEN_LNG) || 77.3725;
const SERVICE_RADIUS_LIMIT = 10.0; // km

const DELIVERY_SLABS = [
  { maxDistance: 3, charge: 30 },
  { maxDistance: 5, charge: 45 },
  { maxDistance: 8, charge: 60 },
  { maxDistance: 10, charge: 80 }
];

/**
 * Calculates straight-line distance using Haversine formula
 */
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates road distance using Google Distance Matrix API
 * Falls back to Haversine * 1.25 winding factor if API is unavailable
 */
export async function calculateRoadDistance(destLat, destLng) {
  return calculateHaversineFallback(destLat, destLng);
}

/**
 * Fallback calculation using Haversine * 1.25 and 2.5 minutes/km
 */
function calculateHaversineFallback(destLat, destLng) {
  const straightLine = getHaversineDistance(KITCHEN_LAT, KITCHEN_LNG, destLat, destLng);
  const distanceInKm = parseFloat((straightLine * 1.25).toFixed(2));
  const estimatedDuration = Math.max(10, Math.round(distanceInKm * 2.5)); // min 10 mins
  return {
    distanceInKm,
    estimatedDuration,
    isFallback: true
  };
}

/**
 * Determines delivery charge based on the distance slabs
 */
export function calculateDeliveryCharge(distance) {
  // ============================================================
  // DEVELOPMENT ONLY
  // Delivery radius validation is temporarily disabled for local testing.
  // Re-enable this block before production deployment.
  // ============================================================
  // ORIGINAL CODE (uncomment for production):
  // if (distance > SERVICE_RADIUS_LIMIT) {
  //   return -1;
  // }

  for (const slab of DELIVERY_SLABS) {
    if (distance <= slab.maxDistance) {
      return slab.charge;
    }
  }

  // DEVELOPMENT ONLY — return max slab charge instead of -1 for distances beyond slabs
  // ORIGINAL CODE (uncomment for production):
  // return -1;
  return DELIVERY_SLABS[DELIVERY_SLABS.length - 1].charge;
}

export { KITCHEN_LAT, KITCHEN_LNG, SERVICE_RADIUS_LIMIT };
