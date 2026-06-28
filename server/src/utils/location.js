import dotenv from "dotenv";
dotenv.config();

// Cafe location coordinates: default to the new coordinates
const KITCHEN_LAT = parseFloat(process.env.CAFE_LATITUDE) || 27.90256;
const KITCHEN_LNG = parseFloat(process.env.CAFE_LONGITUDE) || 78.08232;
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
 * Calculates road distance using Ola Maps Distance Matrix API
 * Falls back to Haversine * 1.25 winding factor if API is unavailable or fails
 */
export async function calculateRoadDistance(destLat, destLng) {
  const apiKey = process.env.OLA_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("[location.js] OLA_MAPS_API_KEY not set. Using Haversine fallback.");
    return calculateHaversineFallback(destLat, destLng);
  }

  try {
    const url = `https://api.olamaps.io/routing/v1/distanceMatrix?origins=${KITCHEN_LAT},${KITCHEN_LNG}&destinations=${destLat},${destLng}&api_key=${apiKey}`;
    const response = await fetch(url, {
      headers: {
        "X-Request-Id": `req_dist_${Date.now()}`
      }
    });

    if (!response.ok) {
      console.warn(`[location.js] Ola Maps Distance Matrix API error: Status ${response.status}. Using fallback.`);
      return calculateHaversineFallback(destLat, destLng);
    }

    const data = await response.json();
    if (
      data.rows &&
      data.rows[0] &&
      data.rows[0].elements &&
      data.rows[0].elements[0] &&
      (data.rows[0].elements[0].status === "OK" || data.rows[0].elements[0].status === "ok")
    ) {
      const element = data.rows[0].elements[0];
      const distanceInMeters = element.distance?.value || 0;
      const durationInSeconds = element.duration?.value || 0;

      const distanceInKm = parseFloat((distanceInMeters / 1000).toFixed(2));
      const estimatedDuration = Math.round(durationInSeconds / 60);

      return {
        distanceInKm,
        estimatedDuration,
        isFallback: false
      };
    } else {
      console.warn("[location.js] Ola Maps Distance Matrix element status not OK. Using fallback.");
      return calculateHaversineFallback(destLat, destLng);
    }
  } catch (error) {
    console.error("[location.js] Error calling Ola Maps Distance Matrix API:", error);
    return calculateHaversineFallback(destLat, destLng);
  }
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
