"use client";

import { useEffect, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

/**
 * BookingMap - FIXED VERSION
 * ----------
 * Handles map rendering, geocoding, routing, and distance/duration calculation
 * Restricted to Oklahoma, US for this application
 *
 * Key improvements:
 * - Proper cleanup on unmount to prevent memory leaks
 * - Better error handling for geocoding and routing
 * - Fixed dependency arrays in useEffect
 * - Abort controller for async operations
 * - More robust null checks
 */

const LIBRARIES = ["places", "geometry"];

export default function BookingMap({
  pickupLocation,
  dropoffLocation,
  stops = [],
  mapDistance,
  mapDuration,
  onRouteCalculated,
}) {
  /* ===========================================================
      REFS FOR MAP, GEOCODER, COORDINATES, MARKERS, AND ROUTE
     =========================================================== */

  const mapRef = useRef(null);
  const geocoderRef = useRef(null);

  const pickupCoordsRef = useRef(null);
  const dropoffCoordsRef = useRef(null);
  const stopCoordsRef = useRef([]);

  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const stopMarkersRef = useRef([]);
  const routePolylineRef = useRef(null);

  const typingTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  /* ===========================================================
      LOAD GOOGLE MAPS JS API
     =========================================================== */

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  /* ===========================================================
      CLEANUP FUNCTION - Remove all markers and polylines
     =========================================================== */

  const cleanup = useCallback(() => {
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setMap(null);
      pickupMarkerRef.current = null;
    }
    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.setMap(null);
      dropoffMarkerRef.current = null;
    }
    stopMarkersRef.current.forEach((m) => m?.setMap(null));
    stopMarkersRef.current = [];

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }
  }, []);

  /* ===========================================================
      FUNCTION: GEOCODE AN ADDRESS (convert text to lat/lng)
      Restricted to Oklahoma, US
     =========================================================== */

  const geocodeAddress = useCallback((address) => {
    return new Promise((resolve) => {
      if (!address?.trim()) {
        resolve(null);
        return;
      }

      if (!window.google?.maps?.Geocoder) {
        console.warn("Google Maps Geocoder not available");
        resolve(null);
        return;
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new google.maps.Geocoder();
      }

      const fullAddress = `${address}, Oklahoma, US`;

      geocoderRef.current.geocode(
        { address: fullAddress },
        (results, status) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            resolve(results[0].geometry.location);
          } else {
            console.warn(`Geocoding failed for "${address}":`, status);
            resolve(null);
          }
        },
      );
    });
  }, []);

  /* ===========================================================
      FUNCTION: FIT MAP VIEW TO ALL MARKERS
     =========================================================== */

  const fitMapToMarkers = useCallback(() => {
    if (!mapRef.current || !window.google?.maps?.LatLngBounds) return;

    const bounds = new google.maps.LatLngBounds();
    let hasLocation = false;

    if (pickupCoordsRef.current) {
      bounds.extend(pickupCoordsRef.current);
      hasLocation = true;
    }
    if (dropoffCoordsRef.current) {
      bounds.extend(dropoffCoordsRef.current);
      hasLocation = true;
    }

    stopCoordsRef.current.forEach((c) => {
      if (c) {
        bounds.extend(c);
        hasLocation = true;
      }
    });

    if (hasLocation && !bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    }
  }, []);

  /* ===========================================================
      FUNCTION: UPDATE MARKERS ON MAP
     =========================================================== */

  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !window.google?.maps?.Marker) return;

    // Clean up existing markers
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setMap(null);
      pickupMarkerRef.current = null;
    }
    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.setMap(null);
      dropoffMarkerRef.current = null;
    }
    stopMarkersRef.current.forEach((m) => m?.setMap(null));
    stopMarkersRef.current = [];

    // Create new pickup marker (red)
    if (pickupCoordsRef.current) {
      pickupMarkerRef.current = new google.maps.Marker({
        position: pickupCoordsRef.current,
        map: mapRef.current,
        title: "Pickup Location",
      });
    }

    // Create new dropoff marker (blue)
    if (dropoffCoordsRef.current) {
      dropoffMarkerRef.current = new google.maps.Marker({
        position: dropoffCoordsRef.current,
        map: mapRef.current,
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        title: "Dropoff Location",
      });
    }

    // Create stop markers (green)
    stopCoordsRef.current.forEach((coords, index) => {
      if (coords) {
        const marker = new google.maps.Marker({
          position: coords,
          map: mapRef.current,
          icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          title: `Stop ${index + 1}`,
        });
        stopMarkersRef.current.push(marker);
      }
    });
  }, []);

  /* ===========================================================
      FUNCTION: CALCULATE ROUTE + DISTANCE + DURATION
     =========================================================== */

  const getRoute = useCallback(() => {
    if (!pickupCoordsRef.current || !dropoffCoordsRef.current) {
      return;
    }

    if (!window.google?.maps?.DirectionsService) {
      console.warn("Google Maps DirectionsService not available");
      return;
    }

    // Check if all stops have valid coordinates
    const validStops = stopCoordsRef.current.filter(Boolean);
    if (
      stopCoordsRef.current.length > 0 &&
      validStops.length !== stopCoordsRef.current.length
    ) {
      // Some stops are still being geocoded or failed
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    const req = {
      origin: pickupCoordsRef.current,
      destination: dropoffCoordsRef.current,
      travelMode: google.maps.TravelMode.DRIVING,
      waypoints: validStops.map((c) => ({
        location: c,
        stopover: true,
      })),
    };

    directionsService.route(req, (result, status) => {
      if (status !== "OK") {
        console.warn("Directions request failed:", status);
        if (onRouteCalculated) {
          onRouteCalculated(null, null);
        }
        return;
      }

      if (!result?.routes?.[0]?.overview_path) {
        console.warn("No route path found");
        return;
      }

      const route = result.routes[0];

      // Remove previous route polyline
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }

      // Draw new polyline
      routePolylineRef.current = new google.maps.Polyline({
        path: route.overview_path,
        geodesic: true,
        strokeWeight: 5,
        strokeColor: "#4285F4",
        map: mapRef.current,
      });

      // Calculate totals
      const legs = route.legs;
      if (!legs?.length) return;

      let totalDistance = 0;
      let totalDuration = 0;

      legs.forEach((leg) => {
        if (leg?.distance?.value) totalDistance += leg.distance.value;
        if (leg?.duration?.value) totalDuration += leg.duration.value;
      });

      const distanceKm = (totalDistance / 1000).toFixed(2);
      const durationMins = Math.ceil(totalDuration / 60);

      if (onRouteCalculated) {
        onRouteCalculated(distanceKm, durationMins);
      }
    });
  }, [onRouteCalculated]);

  /* ===========================================================
      MAIN EFFECT - GEOCODE AND UPDATE MAP
     =========================================================== */

  useEffect(() => {
    if (!isLoaded) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Abort previous geocoding operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const currentAbortController = abortControllerRef.current;

    // Debounce geocoding
    typingTimeoutRef.current = setTimeout(async () => {
      try {
        // Reset coordinates
        pickupCoordsRef.current = null;
        dropoffCoordsRef.current = null;
        stopCoordsRef.current = [];

        // Geocode locations
        const [pickup, dropoff] = await Promise.all([
          geocodeAddress(pickupLocation),
          geocodeAddress(dropoffLocation),
        ]);

        if (currentAbortController.signal.aborted) return;

        pickupCoordsRef.current = pickup;
        dropoffCoordsRef.current = dropoff;

        // Geocode stops
        if (stops?.length > 0) {
          const stopResults = await Promise.all(
            stops.map((s) => geocodeAddress(s)),
          );

          if (currentAbortController.signal.aborted) return;

          stopCoordsRef.current = stopResults;
        }

        // Update UI
        updateMarkers();
        fitMapToMarkers();
        getRoute();
      } catch (error) {
        if (!currentAbortController.signal.aborted) {
          console.error("Error during geocoding:", error);
        }
      }
    }, 500);

    // Cleanup function
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (currentAbortController) {
        currentAbortController.abort();
      }
    };
  }, [
    pickupLocation,
    dropoffLocation,
    stops,
    isLoaded,
    geocodeAddress,
    updateMarkers,
    fitMapToMarkers,
    getRoute,
  ]);

  /* ===========================================================
      CLEANUP ON UNMOUNT
     =========================================================== */

  useEffect(() => {
    return () => {
      cleanup();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cleanup]);

  /* ===========================================================
      ERROR HANDLING
     =========================================================== */

  if (loadError) {
    return (
      <div className="flex items-center justify-center w-full h-64 sm:h-80 md:h-96 lg:h-[600px] bg-red-50 text-red-600 text-center px-3 sm:px-4 rounded-md border border-red-300">
        Error loading Google Maps. Please check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-64 sm:h-80 md:h-96 lg:h-[600px] bg-gray-100 text-gray-600 text-center px-3 sm:px-4">
        Loading map...
      </div>
    );
  }

  /* ===========================================================
      CONDITIONAL UI - SHOW PLACEHOLDER IF NO LOCATIONS
     =========================================================== */

  const nothingSelected =
    !pickupLocation && !dropoffLocation && (!stops || stops.length === 0);

  if (nothingSelected) {
    return (
      <div className="flex items-center justify-center w-full h-64 sm:h-80 md:h-96 lg:h-[600px] bg-gray-100 text-gray-700 text-center px-3 sm:px-4 rounded-md border border-gray-300 shadow-sm text-sm sm:text-base">
        The map will load after choosing a location.
      </div>
    );
  }

  /* ===========================================================
      RENDER MAP + DISTANCE/TIME INFO BOX
     =========================================================== */

  return (
    <div className="relative">
      {/* Map container */}
      <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[600px] rounded-md border border-gray-300 shadow-sm overflow-hidden">
        <GoogleMap
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: 35.4676, lng: -97.5164 }}
          zoom={7}
          options={{
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: "greedy",
            zoomControl: true,
            mapTypeControl: false,
          }}
        />
      </div>

      {/* Floating info card */}
      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-white p-2 sm:p-3 text-xs sm:text-sm shadow-lg rounded border border-gray-200">
        <div className="font-medium text-gray-900">
          Distance: {mapDistance ? (mapDistance * 0.621371).toFixed(2) : "—"}{" "}
          miles
        </div>
        <div className="text-gray-700">Duration: {mapDuration ?? "—"} mins</div>
      </div>
    </div>
  );
}
