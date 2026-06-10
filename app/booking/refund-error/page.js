"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const REASON_MESSAGES = {
  missing_token: "The refund link is incomplete. Please use the full link from the booking confirmation.",
  invalid_token: "This refund link is not valid. It may have already been used or tampered with.",
  expired_token: "This refund link has expired (links are valid for 7 days). Please contact support.",
  booking_not_found: "The booking associated with this refund link could not be found.",
  stripe_error: "There was an error communicating with Stripe. Please try again or contact support.",
};

function RefundErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const bookingId = searchParams.get("bookingId");

  const message = REASON_MESSAGES[reason] || "An unexpected error occurred while processing the refund.";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Refund Failed
        </h1>

        <p className="text-gray-600 text-center mb-6">{message}</p>

        {bookingId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-semibold text-gray-900">#{bookingId}</span>
            </div>
          </div>
        )}

        <a
          href="/admin/operations/bookings"
          className="block w-full py-3 bg-black text-white text-center rounded-lg font-semibold hover:bg-gray-900 transition"
        >
          Back to Bookings
        </a>
      </div>
    </div>
  );
}

export default function RefundErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Loading...</div>}>
      <RefundErrorContent />
    </Suspense>
  );
}
