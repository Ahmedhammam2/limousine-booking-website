"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RefundSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const amount = searchParams.get("amount");
  const warning = searchParams.get("warning");

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

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Refund Processed!
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Your refund has been submitted to Stripe and will appear on the
          original payment method within 5–10 business days.
        </p>

        {/* Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          {bookingId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-semibold text-gray-900">#{bookingId}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between">
              <span className="text-gray-600">Refund Amount:</span>
              <span className="font-semibold text-green-600">${amount}</span>
            </div>
          )}
        </div>

        {/* Partial refund warning */}
        {warning === "partial" && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3">
            Note: Only part of the refund could be processed automatically. Please
            contact support for the remaining amount.
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

export default function RefundSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Loading...</div>}>
      <RefundSuccessContent />
    </Suspense>
  );
}
