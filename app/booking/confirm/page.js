"use client";

import PriceBreakDown from "../../../components/booking/PriceBreakDown";
import TripSummary from "../../../components/booking/TripSummary";
import CustomerInfo from "../../../components/booking/CustomerInfo";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ConfirmPage() {
  const [car, setCar] = useState(null);
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";
  const editedBookingId = searchParams.get("bookingId");
  const carId = searchParams.get("carId");
  const tripType = searchParams.get("tripType");
  const pickup = searchParams.get("pickupLocation");
  const dropoff = searchParams.get("dropoffLocation");

  // Parse duration from URL params, defaulting to 0 if not present
  const duration = JSON.parse(
    searchParams.get("duration") || '{"hours":0,"minutes":0}',
  );
  const distance = Number(searchParams.get("mapDistance") || 0);
  const stops = JSON.parse(searchParams.get("stops") || "[]");

  // Convert kilometers to miles for pricing calculations
  const distanceMiles = distance * 0.621371;
  const hours = duration.hours;
  const minutes = duration.minutes;

  // Calculate total hours including fractional minutes
  const totalHours = hours + minutes / 60;
  const pickupDateRaw = searchParams.get("date");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentLink, setPaymentLink] = useState(null);
  const [difference, setDifference] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isRefund, setIsRefund] = useState(false);

  const startISO = searchParams.get("startISO");

  // Format the pickup time from ISO string to 24-hour time format
  // This handles both string and Date object inputs
  const pickupTime = startISO
    ? typeof startISO === "string"
      ? new Date(startISO).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      : startISO instanceof Date
        ? startISO.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        : String(startISO)
    : "";

  // Format date to localized string (DD/MM/YYYY format for en-GB)
  // Handles multiple input types for flexibility
  const pickupDate = pickupDateRaw
    ? typeof pickupDateRaw === "string"
      ? new Date(pickupDateRaw).toLocaleDateString("en-GB")
      : pickupDateRaw instanceof Date
        ? pickupDateRaw.toLocaleDateString("en-GB")
        : String(pickupDateRaw)
    : "";

  const [finalPrice, setFinalPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);

  useEffect(() => {
    if (!isEditing || !editedBookingId) return;

    async function fetchBooking() {
      const res = await fetch(`/api/bookings/${editedBookingId}`);
      const data = await res.json();
      setOriginalPrice(data.finalPrice);
    }

    fetchBooking();
  }, [isEditing, editedBookingId]);

  // Calculate final price based on trip type whenever dependencies change
  useEffect(() => {
    if (!car) return;

    if (tripType === "transfer") {
      let basePrice = car?.pricePermile * distanceMiles;
      // Ensure minimum price is met
      const total = Math.max(basePrice, car.minprice);
      setFinalPrice(total);
    }

    if (tripType === "hourly") {
      // Bill for minimum hours if trip is shorter
      let billedHours = Math.max(totalHours, car.minHours);
      const total = billedHours * car.pricePerHour;
      setFinalPrice(total);
    }
  }, [car, tripType, distanceMiles, totalHours]);

  // Fetch car details from API on component mount
  useEffect(() => {
    if (!carId) return;
    async function fetchCar() {
      const res = await fetch(`/api/cars/${carId}`);
      const data = await res.json();
      setCar(data);
    }
    fetchCar();
  }, [carId]);

  const router = useRouter();

  async function handleCreate(bookingData) {
    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bookingData,
        finalPrice,
        passengers: searchParams.get("passengers"),
        kids: searchParams.get("kids"),
        luggage: searchParams.get("luggage"),
        stops,
        date: pickupDateRaw,
        startTime: startISO,
        estimatedDuration: totalHours * 60,
        distance: distanceMiles,
      }),
    });

    if (!bookingRes.ok) {
      setError("Booking failed. Please try again.");
      setLoading(false);
      return;
    }

    const bookingJson = await bookingRes.json();
    const bookingId = bookingJson.bookingId;

    const stripeRes = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finalPrice,
        tripType,
        carId,
        carName: car?.name,
        customerName: bookingData?.customerName,
        bookingId,
        searchParams: searchParams.toString(),
      }),
    });

    const { url } = await stripeRes.json();
    if (!url) {
      setError("Payment initialization failed. Please try again.");
      setLoading(false);
      return;
    }
    window.location.href = url;
  }
  async function handleEdit(bookingData) {
    const res = await fetch(`/api/bookings/${editedBookingId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bookingData,
        tripType,
        pickup,
        dropoff,
        passengers: searchParams.get("passengers"),
        kids: searchParams.get("kids"),
        luggage: searchParams.get("luggage"),
        distance: distanceMiles,
        duration: totalHours,
        stops,
        bookingId: editedBookingId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.details || data.error || "Failed to edit booking or process refund.");
    }

    if (data.status === "refund_link_generated") {
      setPaymentLink(data.refundLink);
      setDifference(data.amount);
      setIsRefund(true);
      setShowModal(true);
      return;
    }

    if (data.status === "payment_required") {
      setPaymentLink(data.paymentLink);
      setDifference(data.amount);
      setIsRefund(false);
      setShowModal(true);
      return;
    }

    if (data.status === "no_payment_needed") {
      router.push(`/admin/operations/bookings?toast=updated_success`);
      return;
    }

    if (data.status === "refund_needed") {
      router.push(`/admin/operations/bookings?refund=true`);
    }
  }

  const handleSubmit = async (customerData) => {
    // Prevent duplicate submissions
    if (loading) return;
    setLoading(true);

    // Validate that we have a valid price before proceeding
    if (!finalPrice || finalPrice <= 0) {
      setLoading(false);
      return;
    }

    // Combine customer data with booking details
    const bookingData = {
      ...customerData,
      tripType,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      carId,
      carName: car.name,
    };
    try {
      if (isEditing && editedBookingId) {
        // If editing, update the existing booking
        await handleEdit(bookingData);
      } else {
        await handleCreate(bookingData);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!car ? (
        <div className="flex items-center justify-center h-screen text-gray-600">
          Loading...
        </div>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
            {isEditing && editedBookingId && (
              <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-md">
                Editing Booking #{editedBookingId}
              </div>
            )}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6 md:mb-8">
              Confirm Your Booking
            </h1>

            {/* Desktop uses 2-column layout, mobile stacks vertically */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-start">
              {/* Main content area - takes up 2 columns on desktop */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <TripSummary
                  tripType={tripType}
                  pickupLocation={pickup}
                  dropoffLocation={dropoff}
                  distanceMiles={distanceMiles.toFixed(2)}
                  duration={totalHours.toFixed(2)}
                  passengers={searchParams.get("passengers")}
                  kids={searchParams.get("kids")}
                  luggage={searchParams.get("luggage")}
                  stops={stops}
                  pickupDate={pickupDate}
                  pickupTime={pickupTime}
                  hourlyDuration={
                    tripType === "hourly"
                      ? `${Math.ceil(totalHours)} hours`
                      : null
                  }
                />

                {/* Display error message if booking or payment fails */}
                {error && (
                  <div className="rounded-lg bg-red-100 border border-red-300 p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Payment Link Modal */}
                {showModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                      {/* Header */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>

                      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                        {isRefund ? "Refund Link Generated" : "Booking Updated"}
                      </h2>

                      <p className="text-gray-600 text-center mb-6 text-sm">
                        {isRefund
                          ? "Share this link with the customer to process their refund"
                          : "Additional payment required from customer"}
                      </p>

                      <div className={`border rounded-lg p-4 mb-4 ${isRefund ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                        <div className="text-center">
                          <p className={`text-sm mb-1 ${isRefund ? "text-green-800" : "text-amber-800"}`}>
                            {isRefund ? "Refund Amount:" : "Amount Due:"}
                          </p>
                          <p className={`text-2xl font-bold ${isRefund ? "text-green-900" : "text-amber-900"}`}>
                            ${difference.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Payment Link */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {isRefund ? "Refund Link" : "Payment Link"}
                        </label>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={paymentLink}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg
                       bg-gray-50 truncate
                       focus:outline-none focus:ring-2 focus:ring-green-500"
                          />

                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(paymentLink)
                            }
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600
                       rounded-lg hover:bg-green-700 active:bg-green-800
                       transition whitespace-nowrap"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => setShowModal(false)}
                        className="w-full py-2.5 text-sm font-semibold text-gray-700
                   border border-gray-300 rounded-lg
                   hover:bg-gray-50 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                <CustomerInfo
                  onSubmit={handleSubmit}
                  loading={loading}
                  isEditing={isEditing}
                  editedBookingId={editedBookingId}
                />
              </div>

              {/* Sidebar - sticky on desktop, regular flow on mobile */}
              <div className="lg:sticky lg:top-24">
                <PriceBreakDown
                  car={car}
                  tripType={tripType}
                  distance={distanceMiles.toFixed(2)}
                  finalPrice={finalPrice}
                  billedHours={
                    car?.minHours > totalHours ? car?.minHours : totalHours
                  }
                  totalHours={totalHours}
                  basePrice={car?.pricePermile * distanceMiles}
                  originalPrice={originalPrice}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

