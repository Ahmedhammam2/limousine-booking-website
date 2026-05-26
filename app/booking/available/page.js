"use client";

/*
  AVAILABLE PAGE
  ---------------
  Displays available cars based on booking criteria.
  
  Flow:
  1. Extracts booking parameters from URL query string
  2. Sends booking data to API to check car availability
  3. Displays available cars in responsive grid
  4. Allows user to select a car and proceed to confirmation
  
  Includes:
  - Loading state while fetching cars
  - Responsive grid for car cards
  - Hover effects on buttons and cards
  - Mobile-friendly layout with proper spacing
  - "No cars available" message with option to go back
*/

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CarCard from "../../../components/CarCard";

import { Suspense } from "react";

function AvailablePageContent() {
  const params = useSearchParams();
  const paramsString = params.toString();
  const isEditing = params.get("edit") === "true";
  const bookingId = params.get("bookingId");
  const originalPrice = params.get("originalPrice");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Extract all query parameters from URL
  // These were set on the previous booking form page
  const tripType = params.get("tripType"); // "transfer" or "hourly"
  const startTimestamp = params.get("startTimestamp");
  const endTimestamp1 = params.get("endTimestamp1");
  const startISO = params.get("startISO");

  // Format dates and times for display to user
  const pickupDate = startISO ? new Date(startISO).toLocaleDateString() : "";
  const pickupTime = startTimestamp
    ? new Date(Number(startTimestamp)).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const pickupLocation = params.get("pickupLocation");
  const dropoffLocation = params.get("dropoffLocation");

  // Stops is stored as JSON string in URL, need to parse it back
  const stops = JSON.parse(params.get("stops") || "[]");

  const passengers = params.get("passengers");
  const kids = params.get("kids");
  const luggage = params.get("luggage");

  const mapDistance = params.get("mapDistance");
  const mapDuration = params.get("mapDuration"); // only for transfer trips
  const distanceMiles = mapDistance * 0.621371;

  // Calculate hourly trip duration in readable format
  let hourlyDuration = "";
  if (tripType === "hourly" && endTimestamp1 && startTimestamp) {
    const diffMs = Number(endTimestamp1) - Number(startTimestamp);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    hourlyDuration = `${hours}h ${minutes}m`;
  }

  // Prepare booking data object to send to availability API
  const bookingData = {
    tripType,
    pickupLocation,
    dropoffLocation,
    passengers,
    kids,
    luggage,
    stops,
    startISO,
    // estimatedDuration needs to be in minutes for API
    estimatedDuration:
      tripType === "transfer"
        ? Number(mapDuration) // already in minutes from Google Maps
        : Number((Number(endTimestamp1) - Number(startTimestamp)) / 60000), // convert ms to minutes
  };

  if (isEditing && bookingId) {
    bookingData.edit = true;
    bookingData.bookingId = bookingId;
    bookingData.originalPrice = originalPrice;
  }

  // Handle car selection - adds carId to URL and navigates to confirmation
  const handleSelection = (carId) => {
    const query = new URLSearchParams(params.toString());
    query.set("carId", carId);
    if (isEditing && bookingId) {
      query.set("edit", "true");
      query.set("bookingId", bookingId);
      query.set("originalPrice", originalPrice || "");
    }
    router.push(`/booking/confirm?${query.toString()}`);
  };

  // Fetch available cars when component loads or parameters change
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/available", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        });
        const data = await res.json();
        // Only show cars marked as active
        const filteredCars = data.cars.filter((car) => car.status === "active");
        setCars(filteredCars);
      } catch (err) {
        console.error("Error fetching cars:", err);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
    // Re-run if URL parameters change
  }, [paramsString]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main container with responsive padding */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
        {isEditing && bookingId && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-md">
            Editing Booking #{bookingId}
          </div>
        )}
        {/* Page Header */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Available Vehicles
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Choose the vehicle that best fits your trip
        </p>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16 sm:py-20 text-gray-500 text-sm sm:text-base">
            Checking available vehicles…
          </div>
        )}

        {/* Available Cars Grid */}
        {!loading && cars.length > 0 && (
          <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 sm:gap-6 md:gap-8">
            {cars.map((car) => (
              <div
                key={car._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {/* Car Information */}
                <div className="p-3 sm:p-4 text-gray-800">
                  <CarCard car={car} />
                </div>

                {/* Selection Button */}
                <div className="p-3 sm:p-4 border-t bg-gray-50">
                  <button
                    className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold bg-black text-white hover:bg-gray-900 transition"
                    onClick={() => handleSelection(car._id)}
                  >
                    Select This Vehicle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Form Button - only shows when cars are available */}
        {!loading && cars.length > 0 && (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              onClick={() => router.push(`/booking?${params.toString()}`)}
              className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-black border border-black text-white hover:bg-gray-900 transition"
            >
              Back to Form
            </button>
          </div>
        )}

        {/* No Cars Available Message */}
        {!loading && cars.length === 0 && (
          <div className="mt-8 sm:mt-12 max-w-xl mx-auto bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
            <p className="text-lg sm:text-xl font-semibold text-yellow-800">
              No vehicles available
            </p>

            {/* Display the date and time user selected */}
            <p className="text-sm sm:text-base text-yellow-700">
              No vehicles are available for{" "}
              <span className="font-medium">{pickupDate}</span> at{" "}
              <span className="font-medium">{pickupTime}</span>.
            </p>

            {/* Let user go back and change their search criteria */}
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-gray-900 text-white font-semibold hover:bg-black transition"
            >
              Change Date or Time
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AvailablePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading vehicles...</div>}>
      <AvailablePageContent />
    </Suspense>
  );
}
