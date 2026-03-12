"use client";

import Link from "next/link";
import { useState } from "react";
import { markNoShow } from "@/actions/booking/markNoShow";
import { deleteBooking } from "@/actions/booking/deleteBooking";

export default function BookingsTable({ bookings }) {
  const [searchId, setSearchId] = useState("");

  const filteredBooking = bookings.filter((booking) =>
    booking._id.toLowerCase().includes(searchId.toLowerCase()),
  );

  // Get today's date without the time component for accurate comparison
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <>
      {/* Search input - full width on mobile, maintains padding */}
      <input
        type="text"
        placeholder="Search by Booking ID..."
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        className="mb-4 w-full border p-2 rounded"
      />

      {/* Table wrapper - allows horizontal scrolling on smaller screens */}
      <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
        {/* Desktop table view - hidden on mobile */}
        <table className="hidden md:table w-full text-sm">
          <thead className="bg-gray-100 text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Date</th>
              <th className="p-3">Pickup Time</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Car</th>
              <th className="p-3">Route</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBooking.map((booking) => {
              // Extract just the date part from the booking date
              const bookingDate = new Date(booking.date);
              const bookingDay = new Date(
                bookingDate.getFullYear(),
                bookingDate.getMonth(),
                bookingDate.getDate(),
              );

              // Only allow editing if the booking is scheduled for a future date
              const isEditable = bookingDay.getTime() > today.getTime();

              const isNoShow = booking.status === "no-show";

              return (
                <tr
                  key={booking._id}
                  className={`border-t ${
                    !isEditable
                      ? "bg-gray-100 text-gray-400"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-mono text-xs">
                    {booking._id.slice(-6)}
                  </td>

                  <td className="p-3">
                    {new Date(booking.date).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    {new Date(booking.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="p-3 font-medium">{booking.customerName}</td>

                  <td className="p-3">{booking.customerPhone}</td>

                  <td className="p-3 font-mono text-xs">
                    {booking.carId?.slice(-6)}
                  </td>

                  <td className="p-3 text-sm">
                    <div>
                      <strong>From:</strong> {booking.pickupLocation}
                    </div>
                    <div>
                      <strong>To:</strong> {booking.dropoffLocation}
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "no-show" ||
                                booking.status === "canceled"
                              ? "bg-gray-300 text-gray-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        booking.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </td>

                  <td className="p-3 text-right font-semibold">
                    ${booking.finalPrice.toFixed(2)}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      {isEditable && (
                        <Link
                          href={`/booking/?edit=true&bookingId=${booking._id}`}
                          className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </Link>
                      )}
                      {/* Hide no-show button if already marked */}
                      {!isNoShow && (
                        <button
                          onClick={() => {
                            if (confirm("Mark this booking as No Show?")) {
                              markNoShow(booking._id);
                            }
                          }}
                          className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        >
                          No Show
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Delete booking for ${booking.customerName}?`,
                            )
                          ) {
                            deleteBooking(booking._id);
                          }
                        }}
                        className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile card view - shows only on small screens */}
        <div className="md:hidden divide-y">
          {filteredBooking.map((booking) => {
            const bookingDate = new Date(booking.date);
            const bookingDay = new Date(
              bookingDate.getFullYear(),
              bookingDate.getMonth(),
              bookingDate.getDate(),
            );

            const isEditable = bookingDay.getTime() > today.getTime();
            const isNoShow = booking.status === "no-show";

            return (
              <div
                key={booking._id}
                className={`p-4 space-y-3 ${
                  !isEditable ? "bg-gray-100 text-gray-400" : ""
                }`}
              >
                {/* Booking ID and date section */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Booking ID</div>
                    <div className="font-mono text-sm">
                      {booking._id.slice(-6)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">
                      Date & Time
                    </div>
                    <div className="text-sm">
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs">
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* Customer info */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Customer</div>
                  <div className="font-medium">{booking.customerName}</div>
                  <div className="text-sm">{booking.customerPhone}</div>
                </div>

                {/* Route information */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Route</div>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>From:</strong> {booking.pickupLocation}
                    </div>
                    <div>
                      <strong>To:</strong> {booking.dropoffLocation}
                    </div>
                  </div>
                </div>

                {/* Status badges and price */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "no-show" ||
                              booking.status === "canceled"
                            ? "bg-gray-300 text-gray-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>

                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      booking.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {booking.paymentStatus}
                  </span>

                  <span className="ml-auto font-semibold">
                    ${booking.finalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Car ID */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Car ID</div>
                  <div className="font-mono text-xs">
                    {booking.carId?.slice(-6)}
                  </div>
                </div>

                {/* Action buttons - stacked on mobile for better touch targets */}
                <div className="flex flex-col gap-2 pt-2">
                  {!isNoShow && (
                    <button
                      onClick={() => {
                        if (confirm("Mark this booking as No Show?")) {
                          markNoShow(booking._id);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    >
                      Mark as No Show
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (
                        confirm(`Delete booking for ${booking.customerName}?`)
                      ) {
                        deleteBooking(booking._id);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Delete Booking
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state message */}
        {bookings.length === 0 && (
          <p className="p-6 text-center text-gray-500">No bookings found</p>
        )}
      </div>
    </>
  );
}
