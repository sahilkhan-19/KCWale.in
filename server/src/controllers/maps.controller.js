import dotenv from "dotenv";
dotenv.config();

const OLA_MAPS_API_KEY = process.env.OLA_MAPS_API_KEY || "";
const OLA_BASE_URL = "https://api.olamaps.io";

/**
 * Parses Ola Maps address components into a structured address layout.
 */
function parseAddressComponents(result) {
  if (!result) {
    return { house: "", floor: "", building: "", street: "", area: "", city: "", state: "", pincode: "", landmark: "" };
  }

  const components = result.address_components || [];

  // Centralized Mapping Definitions (higher index means lower priority fallback)
  const fieldMappings = {
    pincode: ["postal_code"],
    state: ["administrative_area_level_1"],
    city: ["locality", "administrative_area_level_2", "postal_town"],
    area: [
      "sublocality_level_1",
      "sublocality_level_2",
      "sublocality_level_3",
      "sublocality",
      "neighborhood",
      "administrative_area_level_3"
    ],
    street: ["route", "street_address", "intersection"],
    house: ["street_number", "house_number"],
    building: ["premise", "subpremise"],
    landmark: ["landmark", "point_of_interest", "establishment", "airport", "park", "natural_feature"]
  };

  // Intermediate storage to hold matching values per field
  const parsedData = {
    house: [],
    building: [],
    street: [],
    area: [],
    city: [],
    state: [],
    pincode: [],
    landmark: []
  };

  // Iterate over components and check each type against our mappings
  for (const component of components) {
    const types = component.types || [];
    const name = (component.long_name || component.short_name || "").trim();
    if (!name) continue;

    for (const [field, matchedTypes] of Object.entries(fieldMappings)) {
      if (types.some(t => matchedTypes.includes(t))) {
        parsedData[field].push({ name, types });
      }
    }
  }

  // Deduplicate and resolve best values for each field
  const resolveField = (field, joiner = ", ") => {
    const items = parsedData[field];
    if (items.length === 0) return "";

    const matchedTypes = fieldMappings[field];
    const getMinTypeIndex = (itemTypes) => {
      let minIdx = Infinity;
      for (const t of itemTypes) {
        const idx = matchedTypes.indexOf(t);
        if (idx !== -1 && idx < minIdx) minIdx = idx;
      }
      return minIdx;
    };

    const uniqueItems = [];
    const seen = new Set();
    for (const item of items) {
      if (!seen.has(item.name.toLowerCase())) {
        seen.add(item.name.toLowerCase());
        uniqueItems.push(item);
      }
    }

    uniqueItems.sort((a, b) => getMinTypeIndex(a.types) - getMinTypeIndex(b.types));
    return uniqueItems.map(item => item.name).join(joiner);
  };

  // Resolve values
  let house = resolveField("house");
  let building = resolveField("building");
  let street = resolveField("street");
  let area = resolveField("area");
  let city = resolveField("city");
  let state = resolveField("state");
  let pincode = resolveField("pincode");
  let landmark = resolveField("landmark");

  // --- Regex & Comma-Separated Extraction Rules for House, Floor, Building & Landmark ---

  const nameVal = (result.name || "").trim();
  const formattedVal = (result.formatted_address || "").trim();
  const addrParts = formattedVal.split(",").map(p => p.trim()).filter(Boolean);

  // 1. Floor Extraction
  let floor = "";
  const floorRegex = /(ground|\d+(st|nd|rd|th)?)\s*floor/i;
  const floorMatch = nameVal.match(floorRegex) || formattedVal.match(floorRegex);
  if (floorMatch) {
    floor = floorMatch[0];
  }

  // 2. House Number Extraction (if not resolved from components)
  if (!house) {
    for (let i = 0; i < Math.min(addrParts.length, 3); i++) {
      const part = addrParts[i];
      if (/^[#a-z0-9-/]+\s*[a-z0-9-/]*$/i.test(part) && /\d/.test(part) && part.length < 10) {
        house = part;
        break;
      }
      const match = part.match(/(flat|plot|house|shop|bldg|no|villa|suite|cabin|room|apt|apartment)\.?\s*([a-z0-9-/]+)/i);
      if (match) {
        house = part;
        break;
      }
    }
  }

  // 3. Building Name Extraction (if not resolved from components)
  const buildingKeywords = [
    "heights", "apartment", "apartments", "apts", "society", "building", "bldg", "villa", "villas",
    "residency", "enclave", "court", "castle", "tower", "towers", "plaza", "insignia", "house",
    "complex", "residencies", "palace", "abode", "nivas", "bhavan", "arcade", "gardens", "estate", "resorts"
  ];

  if (!building) {
    for (let i = 0; i < Math.min(addrParts.length, 4); i++) {
      const part = addrParts[i];
      if (buildingKeywords.some(keyword => part.toLowerCase().includes(keyword))) {
        if (part === floor || part === house) continue;
        building = part;
        break;
      }
    }
  }

  // 4. Establishment/Venue Name Landmark Extraction
  const isGeographicType = (types) => {
    const geoTypes = ["locality", "sublocality", "neighborhood", "political", "country", "postal_code", "administrative_area_level_1", "administrative_area_level_2", "administrative_area_level_3"];
    return types.some(t => geoTypes.includes(t));
  };

  const resultTypes = result.types || [];

  if (nameVal && !isGeographicType(resultTypes)) {
    const lowerName = nameVal.toLowerCase();
    if (
      lowerName !== city.toLowerCase() &&
      lowerName !== state.toLowerCase() &&
      lowerName !== pincode.toLowerCase() &&
      lowerName !== area.toLowerCase() &&
      lowerName !== street.toLowerCase() &&
      lowerName !== house.toLowerCase() &&
      lowerName !== building.toLowerCase()
    ) {
      if (!landmark) {
        landmark = nameVal;
      } else if (!landmark.toLowerCase().includes(lowerName)) {
        landmark = `${nameVal}, ${landmark}`;
      }
    }
  }

  // --- Fallbacks & Refinements ---
  if (!city && area) {
    city = area;
  }

  if (street && area && street.toLowerCase() === area.toLowerCase()) {
    street = ""; 
  }

  if (street && house && street.toLowerCase().includes(house.toLowerCase())) {
    street = street.replace(new RegExp(`^${house}\\s*,?\\s*`, "i"), "").trim();
  }

  return { house, floor, building, street, area, city, state, pincode, landmark };
}

// 1. Places Autocomplete Proxy
export const autocomplete = async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) {
      return res.status(400).json({ message: "Search input is required." });
    }

    if (!OLA_MAPS_API_KEY) {
      return res.status(500).json({ message: "Ola Maps API key is not configured on the server." });
    }

    const response = await fetch(
      `${OLA_BASE_URL}/places/v1/autocomplete?input=${encodeURIComponent(input)}&api_key=${OLA_MAPS_API_KEY}`,
      {
        headers: {
          "X-Request-Id": `req_${Date.now()}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ message: `Ola Maps API Error: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. Reverse Geocoding Proxy
export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    if (!OLA_MAPS_API_KEY) {
      return res.status(500).json({ message: "Ola Maps API key is not configured on the server." });
    }

    const response = await fetch(
      `${OLA_BASE_URL}/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${OLA_MAPS_API_KEY}`,
      {
        headers: {
          "X-Request-Id": `req_${Date.now()}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ message: `Ola Maps API Error: ${errorText}` });
    }

    const data = await response.json();

    if (data.status && data.status.toLowerCase() === "ok" && data.results && data.results.length > 0) {
      const result = data.results[0];
      const parsedAddress = parseAddressComponents(result);
      return res.status(200).json({
        formattedAddress: result.formatted_address,
        address: parsedAddress,
        coordinates: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng)
        }
      });
    }

    return res.status(404).json({ message: "No address found for these coordinates." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 3. Geocoding / Address Validation Proxy
export const geocode = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address || !address.trim() || address.trim() === "undefined" || address.trim() === "null") {
      return res.status(400).json({ message: "Address string is required." });
    }

    if (!OLA_MAPS_API_KEY) {
      return res.status(500).json({ message: "Ola Maps API key is not configured on the server." });
    }

    const response = await fetch(
      `${OLA_BASE_URL}/places/v1/geocode?address=${encodeURIComponent(address)}&api_key=${OLA_MAPS_API_KEY}`,
      {
        headers: {
          "X-Request-Id": `req_${Date.now()}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ message: `Ola Maps API Error: ${errorText}` });
    }

    const data = await response.json();

    // Check data.geocoding nested object
    if (data.geocoding && data.geocoding.status && data.geocoding.status.toLowerCase() === "ok" && data.geocoding.results && data.geocoding.results.length > 0) {
      const result = data.geocoding.results[0];
      const location = result.geometry?.location;
      if (location && location.lat !== undefined && location.lng !== undefined) {
        return res.status(200).json({
          coordinates: {
            latitude: location.lat,
            longitude: location.lng
          },
          formattedAddress: result.formatted_address,
          address: parseAddressComponents(result)
        });
      }
    }

    // Check flat geocodingResults key
    if (data.status && data.status.toLowerCase() === "ok" && data.geocodingResults && data.geocodingResults.length > 0) {
      const result = data.geocodingResults[0];
      const location = result.geometry?.location;
      if (location && location.lat !== undefined && location.lng !== undefined) {
        return res.status(200).json({
          coordinates: {
            latitude: location.lat,
            longitude: location.lng
          },
          formattedAddress: result.formatted_address,
          address: parseAddressComponents(result)
        });
      }
    }

    // Check flat results key
    if (data.status && data.status.toLowerCase() === "ok" && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry?.location;
      if (location && location.lat !== undefined && location.lng !== undefined) {
        return res.status(200).json({
          coordinates: {
            latitude: location.lat,
            longitude: location.lng
          },
          formattedAddress: result.formatted_address,
          address: parseAddressComponents(result)
        });
      }
    }

    console.warn("[maps.controller.js] Geocoding failed. Raw response:", JSON.stringify(data));
    return res.status(404).json({ message: "Could not geocode address." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 4. Place Details Proxy
export const placeDetails = async (req, res) => {
  const requestId = `req_${Date.now()}`;
  console.log(`[maps.controller.js] placeDetails started. place_id: "${req.query.place_id}". RequestId: ${requestId}`);
  try {
    const { place_id } = req.query;
    if (!place_id) {
      console.warn(`[maps.controller.js] placeDetails: missing place_id query param.`);
      return res.status(400).json({ message: "Place ID is required." });
    }

    if (!OLA_MAPS_API_KEY) {
      console.error(`[maps.controller.js] placeDetails: OLA_MAPS_API_KEY is empty or not configured.`);
      return res.status(500).json({ message: "Ola Maps API key is not configured on the server." });
    }

    const url = `${OLA_BASE_URL}/places/v1/details?place_id=${encodeURIComponent(place_id)}&api_key=${OLA_MAPS_API_KEY}`;
    console.log(`[maps.controller.js] placeDetails fetching URL: ${OLA_BASE_URL}/places/v1/details?place_id=${encodeURIComponent(place_id)}&api_key=HIDDEN`);

    const response = await fetch(url, {
      headers: {
        "X-Request-Id": requestId
      }
    });

    console.log(`[maps.controller.js] placeDetails fetch response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[maps.controller.js] placeDetails Ola API failure text: ${errorText}`);
      return res.status(response.status).json({ message: `Ola Maps API Error: ${errorText}` });
    }

    const data = await response.json();
    console.log(`[maps.controller.js] placeDetails raw JSON payload structure keys: ${Object.keys(data).join(", ")}`);
    if (data.result) {
      console.log(`[maps.controller.js] placeDetails result found. name: "${data.result.name}", formatted_address: "${data.result.formatted_address}"`);
      const result = data.result;
      const location = result.geometry?.location;
      if (location && location.lat !== undefined && location.lng !== undefined) {
        const resolvedAddress = parseAddressComponents(result);
        console.log(`[maps.controller.js] placeDetails resolved coordinates: lat: ${location.lat}, lng: ${location.lng}`);
        console.log(`[maps.controller.js] placeDetails resolved address components:`, JSON.stringify(resolvedAddress));
        return res.status(200).json({
          coordinates: {
            latitude: location.lat,
            longitude: location.lng
          },
          formattedAddress: result.formatted_address,
          address: resolvedAddress
        });
      } else {
        console.warn(`[maps.controller.js] placeDetails result has no valid geometry.location. location:`, JSON.stringify(location));
      }
    } else {
      console.warn(`[maps.controller.js] placeDetails data has no result property. full data:`, JSON.stringify(data));
    }

    console.warn("[maps.controller.js] Place details failed. Raw response:", JSON.stringify(data));
    return res.status(404).json({ message: "Could not retrieve details for this place." });
  } catch (error) {
    console.error(`[maps.controller.js] placeDetails error caught:`, error);
    return res.status(500).json({ message: error.message });
  }
};
