"use client";

export default function BookingButton() {
  return (
    <button
      onClick={() => (window.location.href = "/booking")}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      Make Another Booking
    </button>
  );
}
