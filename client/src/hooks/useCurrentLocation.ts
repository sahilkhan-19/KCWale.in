import { useState, useEffect, useCallback, useRef } from "react"

export interface GeolocationState {
  loading: boolean
  error: string | null
  coordinates: { latitude: number; longitude: number } | null
  /** Accuracy of the captured coordinates in meters (from browser Geolocation API) */
  accuracy: number | null
  permissionStatus: "granted" | "denied" | "prompt" | "unsupported" | null
}

/**
 * Minimum accuracy threshold in meters for a delivery-grade GPS fix.
 * Positions more accurate than this are accepted immediately.
 */
const ACCURACY_THRESHOLD_METERS = 100

/**
 * Maximum time (ms) to wait for a high-accuracy fix before accepting best available.
 * GPS cold-start on mobile can take 10–20s; 20s is a reasonable budget.
 */
const MAX_WATCH_DURATION_MS = 20_000

export const useCurrentLocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    coordinates: null,
    accuracy: null,
    permissionStatus: null,
  })

  // Ref to track the best position seen during a watch session
  const bestPositionRef = useRef<{ latitude: number; longitude: number; accuracy: number } | null>(null)

  // Check initial permission if supported
  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, permissionStatus: "unsupported" }))
      return
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          setState((prev) => ({
            ...prev,
            permissionStatus: result.state as GeolocationState["permissionStatus"],
          }))

          result.onchange = () => {
            setState((prev) => ({
              ...prev,
              permissionStatus: result.state as GeolocationState["permissionStatus"],
            }))
          }
        })
        .catch(() => {
          // Fallback if permissions query fails
        })
    }
  }, [])

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by this browser.",
        permissionStatus: "unsupported",
      }))
      return Promise.reject("Geolocation not supported")
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))
    bestPositionRef.current = null

    return new Promise<{ latitude: number; longitude: number; accuracy: number }>((resolve, reject) => {
      let watchId: number | null = null
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      let resolved = false

      const cleanup = () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId)
          watchId = null
        }
        if (timeoutId !== null) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }

      const acceptPosition = (
        latitude: number,
        longitude: number,
        accuracy: number
      ) => {
        if (resolved) return
        resolved = true
        cleanup()

        // DEVELOPMENT ONLY — log captured coordinates for debugging
        console.log(
          `[useCurrentLocation] Accepted GPS fix:`,
          `lat=${latitude}, lng=${longitude}, accuracy=±${accuracy.toFixed(0)}m`
        )

        const coords = { latitude, longitude, accuracy }
        setState((prev) => ({
          ...prev,
          loading: false,
          coordinates: { latitude, longitude },
          accuracy,
          error: null,
          permissionStatus: "granted",
        }))
        resolve(coords)
      }

      const handleError = (error: GeolocationPositionError) => {
        if (resolved) return
        resolved = true
        cleanup()

        let errorMessage = "An unknown error occurred while retrieving location."
        let newPermissionStatus: GeolocationState["permissionStatus"] = null

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "GPS permission denied. Please enable location access in your browser settings."
            newPermissionStatus = "denied"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable. Please make sure your device GPS is on."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again."
            break
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          ...(newPermissionStatus ? { permissionStatus: newPermissionStatus } : {}),
        }))
        reject(errorMessage)
      }

      // =========================================================
      // Strategy: Use watchPosition to progressively refine accuracy.
      // Accept immediately if accuracy ≤ threshold.
      // Otherwise, keep the best fix and accept it when the timer expires.
      // =========================================================

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords

          console.log(
            `[useCurrentLocation] GPS fix received: accuracy=±${accuracy.toFixed(0)}m`
          )

          // Track best position seen so far
          if (
            !bestPositionRef.current ||
            accuracy < bestPositionRef.current.accuracy
          ) {
            bestPositionRef.current = { latitude, longitude, accuracy }
          }

          // If accuracy is good enough for delivery, accept immediately
          if (accuracy <= ACCURACY_THRESHOLD_METERS) {
            acceptPosition(latitude, longitude, accuracy)
          }
        },
        handleError,
        {
          enableHighAccuracy: true,
          timeout: MAX_WATCH_DURATION_MS,
          maximumAge: 0,
        }
      )

      // Fallback timer: if we haven't gotten a good fix within the budget,
      // accept the best position we have (with an accuracy warning)
      timeoutId = setTimeout(() => {
        if (resolved) return

        if (bestPositionRef.current) {
          console.warn(
            `[useCurrentLocation] GPS accuracy budget expired. ` +
            `Accepting best available fix: ±${bestPositionRef.current.accuracy.toFixed(0)}m`
          )
          acceptPosition(
            bestPositionRef.current.latitude,
            bestPositionRef.current.longitude,
            bestPositionRef.current.accuracy
          )
        } else {
          // No position received at all within the budget
          if (!resolved) {
            resolved = true
            cleanup()
            const errorMessage = "Could not determine your location. Please check GPS settings and try again."
            setState((prev) => ({
              ...prev,
              loading: false,
              error: errorMessage,
            }))
            reject(errorMessage)
          }
        }
      }, MAX_WATCH_DURATION_MS + 2000) // +2s buffer beyond the watch timeout
    })
  }, [])

  return {
    ...state,
    getCurrentLocation,
  }
}
