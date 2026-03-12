import mongoose from "mongoose";

/**
 * Booking Schema
 * ----------------
 * Represents a single limousine booking made by a customer.
 * Stores trip details, selected vehicle, pricing, and payment status.
 */
const bookingSchema = new mongoose.Schema(
  {
    /**
     * Reference to the booked car
     */
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    /**
     * Type of trip:
     * - transfer: point-to-point
     * - hourly: time-based rental
     */
    tripType: {
      type: String,
      required: true,
      enum: ["transfer", "hourly"],
    },

    /** Number of passengers */
    passengers: {
      type: Number,
      required: true,
    },

    /** Number of luggage items */
    luggage: {
      type: Number,
      required: true,
    },

    /**
     * Booking time window
     * Used to check availability against other bookings
     */
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },

    /** Customer contact information */
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
      match: [/^\+?\d{7,15}$/, "Phone number is invalid"],
    },
    customerEmail: {
      type: String,
      required: true,
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },

    /** Trip distance in miles */
    distance: {
      type: Number,
      required: true,
    },

    /** Estimated duration in minutes */
    estimatedDuration: {
      type: Number,
      required: true,
    },

    /**
     * Final calculated price after all rules
     * (base price, duration, distance, minimums)
     */
    finalPrice: {
      type: Number,
      required: true,
    },

    /**
     * Booking lifecycle status
     */
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled", "no show"],
      default: "pending",
    },

    /**
     * Payment lifecycle status
     * Updated via Stripe webhooks
     */
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "refunded"],
      default: "unpaid",
    },

    /**
     * Additional payment flow (e.g. after editing a booking)
     * When true, booking changes were saved but extra payment is still required.
     */
    pendingPayment: {
      type: Boolean,
      default: false,
    },
    amountDue: {
      type: Number,
      default: 0,
    },
    paymentLinkUrl: {
      type: String,
      default: null,
    },
    paymentLinkCreatedAt: {
      type: Date,
      default: null,
    },
    paymentLinkExpiresAt: {
      type: Date,
      default: null,
    },

    /** Stripe identifiers (set after successful payment) */
    stripePaymentId: {
      type: String,
      default: null,
    },

    /** Payment audit trail */
    paymentHistory: {
      type: [
        {
          amount: Number,
          type: {
            type: String,
            enum: ["initial_payment", "edit_additional_payment"],
          },
          paymentIntentId: String,
          paidAt: Date,
        },
      ],
      default: [],
    },

    /** Trip locations */
    pickupLocation: {
      type: String,
      required: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
    },

    /** Optional intermediate stops */
    stops: {
      type: [String],
    },

    /** Booking date (used for filtering by day/week/month) */
    date: {
      type: Date,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    // Link-based refund flow
    pendingRefund: {
      type: Boolean,
      default: false,
    },
    refundToken: {
      type: String,
      default: null,
    },
    refundTokenExpiresAt: {
      type: Date,
      default: null,
    },
    refundHistory: {
      type: [
        {
          amount: Number,
          date: Date,
          reason: String,
          stripeRefundId: String,
        },
      ],
      default: [],
    },
  },
  {
    /** Automatically adds createdAt and updatedAt */
    timestamps: true,
  },
);

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
