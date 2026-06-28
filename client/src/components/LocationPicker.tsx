import React, { useState, useEffect, useRef } from "react"
import { MapPin, Search, Check, AlertTriangle, Loader2, Navigation } from "lucide-react"
import { useCurrentLocation } from "../hooks/useCurrentLocation"
import { mapsService } from "../services/maps.service"
import type { AutocompletePrediction } from "../services/maps.service"
import { toast } from "sonner"

export interface DeliveryAddress {
  house: string
  floor: string
  building: string
  street: string
  area: string
  landmark: string
  city: string
  state: string
  pincode: string
  apartment?: string
}

export interface Coordinates {
  latitude: number
  longitude: number
}

interface LocationPickerProps {
  address: DeliveryAddress
  setAddress: (address: DeliveryAddress) => void
  coordinates: Coordinates | null
  setCoordinates: (coords: Coordinates | null) => void
  gpsAccuracy: number | null
  setGpsAccuracy: (accuracy: number | null) => void
  isOutsideRadius?: boolean
  deliveryMetrics?: any
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  address,
  setAddress,
  coordinates,
  setCoordinates,
  gpsAccuracy,
  setGpsAccuracy,
  isOutsideRadius = false,
  deliveryMetrics = null,
}) => {
  const { getCurrentLocation, loading: gpsLoading } = useCurrentLocation()

  // Search input state
  const [searchQuery, setSearchQuery] = useState("")
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showPredictions, setShowPredictions] = useState(false)
  const [reverseGeocodingLoading, setReverseGeocodingLoading] = useState(false)

  const autocompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset search query if address is cleared
  useEffect(() => {
    const isAddressEmpty = !address.house && !address.street && !address.area;
    if (isAddressEmpty && !coordinates) {
      setSearchQuery("")
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }, [address, coordinates])

  // Handle click outside to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPredictions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Debounced autocomplete search
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    if (val.trim().length < 3) {
      setPredictions([])
      return
    }

    setIsSearching(true)
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current)
    }

    autocompleteTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await mapsService.autocomplete(val)
        if (res && res.predictions) {
          setPredictions(res.predictions)
          setShowPredictions(true)
        }
      } catch (err) {
        console.error("Autocomplete error:", err)
      } finally {
        setIsSearching(false)
      }
    }, 400) // 400ms debounce
  }

  // Handle GPS location capture
  const handleCaptureLocation = async () => {
    setReverseGeocodingLoading(true)
    try {
      const result = await getCurrentLocation()
      const coords = { latitude: result.latitude, longitude: result.longitude }
      setCoordinates(coords)
      setGpsAccuracy(result.accuracy)
      localStorage.setItem("kcwale_coords", JSON.stringify(coords))
      localStorage.setItem("kcwale_gps_accuracy", String(result.accuracy))

      // Reverse geocode captured GPS coordinates
      const reverseRes = await mapsService.reverseGeocode(result.latitude, result.longitude)
      if (reverseRes && reverseRes.address) {
        const resolvedAddr = reverseRes.address
        const updated = {
          ...address,
          house: resolvedAddr.house || address.house,
          floor: resolvedAddr.floor || address.floor,
          building: resolvedAddr.building || address.building,
          street: resolvedAddr.street || address.street,
          area: resolvedAddr.area || address.area,
          landmark: resolvedAddr.landmark || address.landmark,
          city: resolvedAddr.city || address.city,
          state: resolvedAddr.state || address.state,
          pincode: resolvedAddr.pincode || address.pincode,
        }
        setAddress(updated)
        localStorage.setItem("kcwale_address", JSON.stringify(updated))
        toast.success("📍 Location found successfully.")
      } else {
        toast.warning("We found your coordinates, but please enter your address details manually.")
      }
    } catch (err: any) {
      toast.error("We couldn't determine your location. Please check your GPS settings and try again.")
    } finally {
      setReverseGeocodingLoading(false)
    }
  }

  // Handle suggestion select
  const handleSelectPrediction = async (prediction: AutocompletePrediction) => {
    console.log("[LocationPicker] handleSelectPrediction executing. prediction:", JSON.stringify(prediction));
    if (!prediction || !prediction.place_id) {
      console.warn("[LocationPicker] Missing place_id in prediction.");
      toast.warning("Please enter a location to search.")
      return
    }

    setSearchQuery("")
    setShowPredictions(false)
    setReverseGeocodingLoading(true)

    try {
      console.log("[LocationPicker] Requesting place details for place_id:", prediction.place_id);
      const detailsRes = await mapsService.details(prediction.place_id)
      console.log("[LocationPicker] detailsRes response payload:", JSON.stringify(detailsRes));

      const coords = {
        latitude: detailsRes.coordinates.latitude,
        longitude: detailsRes.coordinates.longitude,
      }
      console.log("[LocationPicker] Extracted coordinates:", coords);

      setCoordinates(coords)
      setGpsAccuracy(null) // Reset GPS accuracy since it's geocoded address
      localStorage.setItem("kcwale_coords", JSON.stringify(coords))
      localStorage.removeItem("kcwale_gps_accuracy")

      if (detailsRes.address) {
        console.log("[LocationPicker] parsed address components from details:", JSON.stringify(detailsRes.address));
        const resolvedAddr = detailsRes.address
        const updated = {
          ...address,
          house: resolvedAddr.house || address.house,
          floor: resolvedAddr.floor || address.floor,
          building: resolvedAddr.building || address.building,
          street: resolvedAddr.street || address.street,
          area: resolvedAddr.area || address.area,
          landmark: resolvedAddr.landmark || address.landmark,
          city: resolvedAddr.city || address.city,
          state: resolvedAddr.state || address.state,
          pincode: resolvedAddr.pincode || address.pincode,
        }
        console.log("[LocationPicker] Updating Address State:", JSON.stringify(updated));
        setAddress(updated)
        localStorage.setItem("kcwale_address", JSON.stringify(updated))
        toast.success("Delivery location selected successfully.")
      } else {
        console.warn("[LocationPicker] detailsRes.address is falsy.");
      }
    } catch (err: any) {
      console.error("[LocationPicker] handleSelectPrediction failed:", err);
      if (err.response) {
        console.error("[LocationPicker] API Error Response Status:", err.response.status);
        console.error("[LocationPicker] API Error Response Data:", JSON.stringify(err.response.data));
      }
      toast.error("We couldn't find your address. Please enter it manually.")
    } finally {
      setReverseGeocodingLoading(false)
    }
  }

  // Trigger search manually for geocoding
  const triggerSearch = async () => {
    const directValue = inputRef.current ? inputRef.current.value : ""
    const queryToUse = directValue || searchQuery
    const trimmedQuery = queryToUse.trim()
    console.log("[LocationPicker] triggerSearch executing. queryToUse:", queryToUse);
    if (!trimmedQuery) {
      console.warn("[LocationPicker] Empty search query blocked.");
      toast.warning("Please enter a location to search.")
      return
    }

    setReverseGeocodingLoading(true)
    setShowPredictions(false)

    try {
      console.log("[LocationPicker] Requesting geocoding for query:", trimmedQuery);
      const geocodeRes = await mapsService.geocode(trimmedQuery)
      console.log("[LocationPicker] geocodeRes response payload:", JSON.stringify(geocodeRes));

      const coords = {
        latitude: geocodeRes.coordinates.latitude,
        longitude: geocodeRes.coordinates.longitude,
      }
      console.log("[LocationPicker] Extracted coordinates:", coords);

      setCoordinates(coords)
      setGpsAccuracy(null) // Reset GPS accuracy since it's geocoded address
      localStorage.setItem("kcwale_coords", JSON.stringify(coords))
      localStorage.removeItem("kcwale_gps_accuracy")

      // 2. Obtain address components from geocode response (preferred) or reverse geocode (fallback)
      let resolvedAddr = geocodeRes.address;
      if (!resolvedAddr || !resolvedAddr.street || !resolvedAddr.area) {
        console.log("[LocationPicker] Missing street/area in geocode address. Running reverse geocoding fallback.");
        const reverseRes = await mapsService.reverseGeocode(coords.latitude, coords.longitude)
        console.log("[LocationPicker] fallback reverseGeocode response:", JSON.stringify(reverseRes));
        if (reverseRes && reverseRes.address) {
          resolvedAddr = reverseRes.address
        }
      }

      if (resolvedAddr) {
        console.log("[LocationPicker] parsed address components:", JSON.stringify(resolvedAddr));
        const updated = {
          ...address,
          house: resolvedAddr.house || address.house,
          floor: resolvedAddr.floor || address.floor,
          building: resolvedAddr.building || address.building,
          street: resolvedAddr.street || address.street,
          area: resolvedAddr.area || address.area,
          landmark: resolvedAddr.landmark || address.landmark,
          city: resolvedAddr.city || address.city,
          state: resolvedAddr.state || address.state,
          pincode: resolvedAddr.pincode || address.pincode,
        }
        console.log("[LocationPicker] Updating Address State:", JSON.stringify(updated));
        setAddress(updated)
        localStorage.setItem("kcwale_address", JSON.stringify(updated))
        toast.success("Your address has been updated.")
      }
    } catch (err: any) {
      console.error("[LocationPicker] triggerSearch failed:", err);
      if (err.response) {
        console.error("[LocationPicker] API Error Response Status:", err.response.status);
        console.error("[LocationPicker] API Error Response Data:", JSON.stringify(err.response.data));
      }
      toast.error("We couldn't find your address. Please enter it manually.")
    } finally {
      setReverseGeocodingLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      triggerSearch()
    }
  }

  const updateAddressField = (field: keyof DeliveryAddress, value: string) => {
    const updated = { ...address, [field]: value }
    setAddress(updated)
    localStorage.setItem("kcwale_address", JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      {/* 1. Ola Autocomplete Search Box */}
      <div ref={containerRef} className="relative flex flex-col">
        <label className="text-xs font-semibold text-on-surface-variant mb-1 ml-1">
          Search for Delivery Area / Locality
        </label>
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={triggerSearch}
            className="absolute left-3.5 text-on-surface-variant/50 hover:text-primary transition-colors focus:outline-none z-10"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search your delivery area/locality (e.g. Amir Nishan, Aligarh)"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => predictions.length > 0 && setShowPredictions(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs font-medium placeholder-on-surface-variant/40"
          />
          {isSearching && (
            <Loader2 className="absolute right-3.5 w-4 h-4 text-primary animate-spin" />
          )}
        </div>

        {/* Dropdown Suggestions List */}
        {showPredictions && predictions.length > 0 && (
          <div className="absolute top-[100%] left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-surface-container border border-outline-variant/40 rounded-xl shadow-xl divide-y divide-outline-variant/20 animate-in fade-in slide-in-from-top-1 duration-150">
            {predictions.map((p) => (
              <button
                key={p.place_id}
                type="button"
                onClick={() => handleSelectPrediction(p)}
                className="w-full px-4 py-3 text-left text-xs text-on-surface font-semibold hover:bg-primary/5 transition-colors flex items-start gap-2.5"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{p.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Capture GPS Location Button */}
      <div className="space-y-2.5">
        <button
          type="button"
          disabled={gpsLoading || reverseGeocodingLoading}
          onClick={handleCaptureLocation}
          className="w-full py-3 bg-primary hover:bg-primary/95 disabled:bg-primary/70 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {gpsLoading || reverseGeocodingLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Fetching Exact Location...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 text-white fill-white" />
              <span>📍 Get My Exact Location</span>
            </>
          )}
        </button>

        {/* Delivery metrics / warnings for customer */}
        {coordinates && (isOutsideRadius || deliveryMetrics) && (
          <div className="border border-outline-variant/30 p-3.5 rounded-xl bg-surface-container-low text-left animate-in fade-in duration-200">
            {isOutsideRadius ? (
              <p className="text-red-500 font-bold text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Outside delivery range (10 km service limit)
              </p>
            ) : (
              deliveryMetrics && (
                <div className="flex items-center gap-3 text-on-surface-variant text-[11px] font-bold">
                  <span className="bg-surface-container-highest px-2 py-0.5 rounded">
                    🛵 {deliveryMetrics.distanceInKm.toFixed(1)} km away
                  </span>
                  <span className="bg-surface-container-highest px-2 py-0.5 rounded">
                    ⏱ {deliveryMetrics.estimatedDuration} mins
                  </span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded ml-auto">
                    ₹{deliveryMetrics.deliveryCharge} delivery fee
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <hr className="border-outline-variant/10" />

      {/* 3. Manual Address Fields Grid */}
      <div className="space-y-4 text-left">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
          Complete Manual Address Details *
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
              House / Flat No. *
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 101, Ground Floor"
              value={address.house}
              onChange={(e) => updateAddressField("house", e.target.value)}
              required
              className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
              Floor (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 1st Floor, G/F"
              value={address.floor}
              onChange={(e) => updateAddressField("floor", e.target.value)}
              className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
              Building Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Sunshine Apartments"
              value={address.building}
              onChange={(e) => updateAddressField("building", e.target.value)}
              className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Near Metro Station"
              value={address.landmark}
              onChange={(e) => updateAddressField("landmark", e.target.value)}
              className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
              Street *
            </label>
            <input
              type="text"
              placeholder="e.g. Main Road, Street 5"
              value={address.street}
              onChange={(e) => updateAddressField("street", e.target.value)}
              required
              className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
              Area / Locality *
            </label>
            <input
              type="text"
              placeholder="e.g. Sector 62"
              value={address.area}
              onChange={(e) => updateAddressField("area", e.target.value)}
              required
              className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
              City *
            </label>
            <input
              type="text"
              placeholder="e.g. Noida"
              value={address.city}
              onChange={(e) => updateAddressField("city", e.target.value)}
              required
              className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
              State *
            </label>
            <input
              type="text"
              placeholder="e.g. Uttar Pradesh"
              value={address.state}
              onChange={(e) => updateAddressField("state", e.target.value)}
              required
              className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
              PIN Code *
            </label>
            <input
              type="text"
              placeholder="e.g. 201301"
              value={address.pincode}
              onChange={(e) => updateAddressField("pincode", e.target.value)}
              required
              className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
