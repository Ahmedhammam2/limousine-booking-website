"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { updateBooking } from "@/actions/booking/updateBooking";

export default function EditBookingForm({ booking }) {
  const [formData, setFormData] = useState({
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation,
    stops: booking.stops || [],
    passengers: booking.passengers,
    luggage: booking.luggage,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    finalPrice: booking.finalPrice,
    date: booking.date.slice(0, 10),
    startTime: booking.startTime.slice(11, 16),
  });

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "stops") {
      setFormData((prev) => ({
        ...prev,
        stops: value
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function validateForm() {
    const {
      customerName,
      customerPhone,
      customerEmail,
      passengers,
      luggage,
      finalPrice,
      date,
      startTime,
      status,
      paymentStatus,
    } = formData;

    if (!customerName.trim()) return "Customer name is required";

    if (!/^\+?\d{6,15}$/.test(customerPhone)) return "Invalid phone number";

    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) return "Invalid email address";

    const p = Number(passengers);
    const l = Number(luggage);
    const price = Number(finalPrice);

    if (!Number.isInteger(p) || p < 1 || p > 50)
      return "Passengers must be between 1 and 50";

    if (!Number.isInteger(l) || l < 0 || l > 50)
      return "Luggage must be between 0 and 50";

    if (price <= 0 || price > 100000) return "Final price is not reasonable";

    const start = new Date(`${date}T${startTime}`);

    const now = new Date();

    if (start < now) return "Booking cannot be in the past";

    if (paymentStatus === "paid" && status === "pending")
      return "Paid bookings cannot be pending";

    if (
      paymentStatus === "refunded" &&
      !["canceled", "no-show"].includes(status)
    )
      return "Refunded bookings must be canceled or no-show";

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      ...formData,
      startTime: new Date(`${formData.date}T${formData.startTime}`),
    };

    await updateBooking(booking._id, payload);
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 border rounded-lg bg-white"
    >
      <h2 className="text-xl font-bold">Edit Booking</h2>

      {/* Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
      </div>

      {/* Locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Pickup Location</label>
          <input
            type="text"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Dropoff Location</label>
          <input
            type="text"
            name="dropoffLocation"
            value={formData.dropoffLocation}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
      </div>

      {/* Stops */}
      <div>
        <label className="block text-sm font-medium">
          Stops (one per line)
        </label>
        <textarea
          name="stops"
          value={formData.stops.join("\n")}
          onChange={handleChange}
          className="w-full border p-2 rounded min-h-[80px]"
        />
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Passengers</label>
          <input
            type="number"
            name="passengers"
            value={formData.passengers}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Luggage</label>
          <input
            type="number"
            name="luggage"
            value={formData.luggage}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Final Price</label>
          <input
            type="number"
            name="finalPrice"
            value={formData.finalPrice}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="canceled">Canceled</option>
            <option value="no show">No Show</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Payment Status</label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Booking Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
      </div>

      <button className="w-full sm:w-fit bg-black text-white px-6 py-2 rounded hover:bg-gray-900">
        Save Changes
      </button>
    </form>
  );
}
