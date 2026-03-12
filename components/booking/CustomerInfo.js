"use client";

import { useState, useEffect } from "react";

export default function CustomerInfo({
  onSubmit,
  loading,
  isEditing,
  editedBookingId,
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If editing an existing booking, fetch the customer info
    if (isEditing && editedBookingId) {
      async function fetchBooking() {
        const res = await fetch(`/api/bookings/${editedBookingId}`);
        const data = await res.json();
        if (
          data &&
          data.customerName &&
          data.customerEmail &&
          data.customerPhone
        ) {
          setCustomerName(data.customerName);
          setCustomerEmail(data.customerEmail);
          setCustomerPhone(data.customerPhone);
        }
      }
      fetchBooking();
    }
  }, [isEditing, editedBookingId]);

  const validate = () => {
    const e = {};

    // Full name validation
    const fullNameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)+$/;
    if (!customerName.trim()) {
      e.customerName = "Full name is required";
    } else if (!fullNameRegex.test(customerName.trim())) {
      e.customerName = "Please enter your first and last name";
    }

    // Email validation (your current one is fine)
    if (!customerEmail) {
      e.customerEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      e.customerEmail = "Invalid email address";
    }

    // Phone number validation
    const digitsOnly = customerPhone.replace(/\D/g, "");
    if (!customerPhone.trim()) {
      e.customerPhone = "Phone number is required";
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      e.customerPhone = "Please enter a valid phone number";
    }

    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    onSubmit({
      customerName,
      customerEmail,
      customerPhone,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Customer Information
      </h2>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Full Name</label>
        <input
          className="text-gray-900 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="John Doe"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        {errors.customerName && (
          <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Email Address
        </label>
        <input
          className="text-gray-900 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="email@example.com"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />
        {errors.customerEmail && (
          <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
        <input
          className="text-gray-900 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+1 555 123 4567"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />
        {errors.customerPhone && (
          <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* Cancel — secondary */}
        <button
          disabled={loading}
          onClick={() => window.history.back()}
          className="w-full border border-gray-300 bg-white hover:bg-gray-100 transition py-3 rounded-lg font-medium text-gray-700"
        >
          Cancel
        </button>

        {/* Continue — primary */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Redirecting..." : "Continue to Payment"}
        </button>
      </div>
    </div>
  );
}
