"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import DatePickerField from "./DatePickerField";
import TripTypeSelector from "./TripTypeSelector";
import TimePickerField from "./TimePickerField";
import DurationSelector from "./DurationSelector";
import LocationInput from "./LocationInput";
import PassengerLuggageInput from "./PassengerLuggageInput";
import BookingMap from "./BookingMap";

/**
 * BookingForm
 * -----------
 * Main booking form responsible for collecting trip details
 * (date, time, locations, passengers, etc.)
 *
 * This component:
 * - Manages booking state
 * - Validates user input
 * - Calculates start/end times
 * - Redirects to available cars page
 */
export default function BookingForm({ isEditing, initialData, bookingId }) {
  const searchParams = useSearchParams();
  // Track if we're restoring from URL params to prevent unwanted side effects
  const isCommingFromUrl = useRef(true);
  const router = useRouter();

  /* =========================
     Booking State
     ========================= */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripType, setTripType] = useState("transfer");
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [stops, setStops] = useState([]);
  const [passengers, setPassengers] = useState(1);
  const [kids, setKids] = useState(0);
  const [luggage, setLuggage] = useState(0);

  // Map-calculated values (distance in km, duration in minutes)
  const [mapDistance, setMapDistance] = useState(null);
  const [mapDuration, setMapDuration] = useState(null);

  const [duration, setDuration] = useState({ hours: 2, minutes: 0 });
  const [endTime, setEndTime] = useState(null);
  const [errors, setErrors] = useState({});

  /* =========================
     Effects
     ========================= */

  useEffect(() => {
    if (!initialData) return;

    setTripType(initialData.tripType || "");
    setDate(initialData.date ? new Date(initialData.date) : null);
    setStartTime(
      initialData.startTime ? new Date(initialData.startTime) : null,
    );
    setPickupLocation(initialData.pickupLocation || "");
    setDropoffLocation(initialData.dropoffLocation || "");
    setPassengers(initialData.passengers || 1);
    setLuggage(initialData.luggage || 0);
    setKids(initialData.kids || 0);
    setStops(initialData.stops || []);
    if (initialData.duration) {
      setDuration({
        hours: initialData.duration.hours || 2,
        minutes: initialData.duration.minutes || 0,
      });
    }
  }, [initialData]);
  // Restore form state from URL parameters when user navigates back
  // This preserves their progress and prevents data loss
  useEffect(() => {
    if (!searchParams) return;

    const tripTypeParam = searchParams.get("tripType");
    const pickupLocationParam = searchParams.get("pickupLocation");
    const dropoffLocationParam = searchParams.get("dropoffLocation");
    const passengersParam = searchParams.get("passengers");
    const kidsParam = searchParams.get("kids");
    const luggageParam = searchParams.get("luggage");
    const stopsParam = searchParams.get("stops");
    const startISOParam = searchParams.get("startISO");

    if (tripTypeParam) setTripType(tripTypeParam);
    if (pickupLocationParam) setPickupLocation(pickupLocationParam);
    if (dropoffLocationParam) setDropoffLocation(dropoffLocationParam);
    if (passengersParam) setPassengers(Number(passengersParam));
    if (kidsParam) setKids(Number(kidsParam));
    if (luggageParam) setLuggage(Number(luggageParam));

    if (stopsParam) {
      setStops(JSON.parse(stopsParam));
    }

    // Parse ISO string back to Date objects for both date and time
    if (startISOParam) {
      const d = new Date(startISOParam);
      setDate(d);
      setStartTime(d);
    }

    // Use microtask to ensure all state updates complete before flipping flag
    queueMicrotask(() => {
      isCommingFromUrl.current = false;
    });
  }, []);

  // Clear time selection when date changes to prevent invalid date-time combinations
  // Skip this behavior during initial URL restoration
  useEffect(() => {
    if (isCommingFromUrl.current) return;
    if (isEditing) return;
    setStartTime(null);
  }, [date, isEditing]);

  /* =========================
     Validation
     ========================= */
  const validateForm = () => {
    const newErrors = {};

    if (!date) newErrors.date = "Date is required";
    if (!startTime) newErrors.startTime = "Pickup time is required";
    if (!pickupLocation)
      newErrors.pickupLocation = "Pickup location is required";
    if (!dropoffLocation)
      newErrors.dropoffLocation = "Dropoff location is required";

    // Ensure all stops have valid addresses (no empty strings)
    if (stops.length > 0 && !stops.every((s) => s.trim() !== "")) {
      newErrors.stops = "All stops must have valid locations";
    }

    // For transfer trips, route calculation must complete successfully
    if (tripType === "transfer" && !mapDuration) {
      newErrors.map = "Route not calculated. Please enter valid locations.";
    }

    return newErrors;
  };

  /* =========================
     Date / Time helpers
     ========================= */

  // Merge selected date and time into a single DateTime object
  const buildStartDateTime = () => {
    if (!date || !startTime) return null;
    const d = new Date(date);
    d.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    return d;
  };

  // Calculate when the trip ends based on type:
  // - Transfer: use map-calculated duration
  // - Hourly: use user-selected hour/minute duration
  const buildEndDateTime = (startDate) => {
    if (!startDate) return null;
    const end = new Date(startDate);

    if (tripType === "transfer" && mapDuration) {
      end.setMinutes(end.getMinutes() + Number(mapDuration));
    } else if (tripType === "hourly") {
      end.setHours(end.getHours() + Number(duration.hours));
      end.setMinutes(end.getMinutes() + Number(duration.minutes));
    }

    return end;
  };

  /* =========================
     Submit handler
     ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const startDT = buildStartDateTime();
    if (!startDT) return;

    const endDT = buildEndDateTime(startDT);
    if (!endDT) return;

    setEndTime(endDT.toISOString());

    // Prepare all booking data for the availability check endpoint
    const bookingData = {
      tripType,
      startTimestamp: String(startDT.getTime()),
      endTimestamp1: String(endDT.getTime()),
      startISO: startDT.toISOString(),
      date: startDT.toLocaleDateString(),
      pickupLocation,
      dropoffLocation,
      stops: JSON.stringify(stops),
      passengers: String(passengers),
      kids: String(kids),
      luggage: String(luggage),
      mapDistance: mapDistance ?? "",
      mapDuration: mapDuration ?? "",
      duration: JSON.stringify(duration),
    };

    if (isEditing && bookingId) {
      bookingData.edit = "true";
      bookingData.bookingId = bookingId;
      bookingData.originalPrice = String(
        searchParams.get("originalPrice") || "",
      );
    }

    // Update UI to show loading state
    setIsSubmitting(true);

    // Pre-check availability (optional but improves UX)
    await fetch("/api/available", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    // Navigate to availability page with all booking data in URL
    const query = new URLSearchParams(bookingData).toString();
    router.push(`/booking/available?${query}`);
  };

  /* =========================
     Render
     ========================= */
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      {isEditing && bookingId && (
        <div className="mb-4 sm:mb-6">
          <div
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 
                    bg-amber-50 border border-amber-200 text-amber-900 
                    rounded-md px-3 sm:px-4 py-2.5 sm:py-3"
          >
            {/* Text */}
            <p className="text-sm sm:text-base font-medium">Editing Booking</p>

            {/* Badge */}
            <span
              className="inline-flex items-center w-fit
                       px-2 py-0.5 rounded-full
                       text-xs sm:text-sm font-semibold
                       bg-amber-200 text-amber-900"
            >
              #{bookingId}
            </span>
          </div>
        </div>
      )}

      {/* Two-column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-4 sm:gap-6">
        {/* LEFT: Booking form */}
        <div className="w-full bg-white rounded-md shadow p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-black">
            Where & When
          </h2>

          <TripTypeSelector value={tripType} onChange={setTripType} />

          {/* Hourly duration selector with smooth slide-down animation */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              tripType === "hourly"
                ? "max-h-40 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <DurationSelector
              hours={duration.hours}
              minutes={duration.minutes}
              onHoursChange={(h) => setDuration((p) => ({ ...p, hours: h }))}
              onMinutesChange={(m) =>
                setDuration((p) => ({ ...p, minutes: m }))
              }
            />
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Pickup Date & Time
            </label>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <DatePickerField value={date} onChange={setDate} />
              <TimePickerField
                value={startTime}
                onChange={setStartTime}
                selectedDate={date}
                error={errors.startTime}
              />
            </div>

            {(errors.date || errors.startTime) && (
              <p className="text-red-500 text-xs sm:text-sm">
                Date and time must be selected
              </p>
            )}
          </div>

          {/* Locations */}
          <LocationInput
            pickUp={pickupLocation}
            onPickUpChange={setPickupLocation}
            dropOff={dropoffLocation}
            onDropOffChange={setDropoffLocation}
            stops={stops}
            onStopsChange={setStops}
            pickUpError={errors.pickupLocation}
            dropOffError={errors.dropoffLocation}
            stopsError={errors.stops}
            mapError={errors.map}
          />

          {/* Passengers & luggage */}
          <PassengerLuggageInput
            passengers={passengers}
            onPassengersChange={setPassengers}
            kids={kids}
            onKidsChange={setKids}
            luggage={luggage}
            onLuggageChange={setLuggage}
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              className="w-full sm:w-1/2 py-2.5 sm:py-3 text-sm sm:text-base border border-black text-black bg-white rounded-md hover:bg-black hover:text-white transition"
              onClick={() => router.push("/")}
            >
              Cancel
            </button>

            <button
              type="button"
              className="w-full sm:w-1/2 py-2.5 sm:py-3 text-sm sm:text-base bg-black text-white rounded-md hover:bg-gray-900 transition"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Checking availability..." : "Continue"}
            </button>
          </div>
        </div>

        {/* RIGHT: Map - sticky on desktop for better UX */}
        <div className="w-full bg-white rounded-md shadow p-4 sm:p-5 md:p-6 lg:sticky lg:top-4 min-h-[280px] sm:min-h-[320px]">
          <BookingMap
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            stops={stops}
            mapDistance={mapDistance}
            mapDuration={mapDuration}
            onRouteCalculated={(dist, dur) => {
              setMapDistance(dist);
              setMapDuration(dur);
            }}
          />
        </div>
      </div>
    </div>
  );
}
