"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;

    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        setBooking(data);
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Your booking has been updated
        </p>

        {/* Booking Details */}
        {booking && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-semibold text-gray-900">#{bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Additional Payment:</span>
              <span className="font-semibold text-green-600">
                ${(booking.paymentHistory?.length > 0 ? booking.paymentHistory[booking.paymentHistory.length - 1].amount : booking.amountDue)?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-gray-900 capitalize">
                {booking.status}
              </span>
            </div>
          </div>
        )}



        {/* Actions */}
        <div className="space-y-3">
          <a
            href="/admin/operations/bookings"
            className="block w-full py-3 bg-black text-white text-center rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Back to Bookings
          </a>
        </div>
      </div>
    </div>
  );
}


