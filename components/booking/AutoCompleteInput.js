"use client";

import { useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

export default function AutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
}) {
  const inputRef = useRef(null);

  // Load Google Maps HERE just like BookingMap
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry"],
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Geographic bounds roughly covering Oklahoma City
    const oklahomaCityBounds = {
      north: 35.7,
      south: 35.3,
      west: -97.8,
      east: -97.2,
    };

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      bounds: oklahomaCityBounds,
      strictBounds: true,
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      } else {
        onChange(inputRef.current.value);
      }
    });
  }, [isLoaded]);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}
