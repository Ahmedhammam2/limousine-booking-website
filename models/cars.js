import mongoose from "mongoose";

/**
 * Car Schema
 * ----------
 * Represents a limousine vehicle that can be booked.
 * Used for availability checks and price calculation.
 */
const carSchema = new mongoose.Schema(
  {
    /** Vehicle category (e.g. SUV, Sedan, Stretch) */
    type: {
      type: String,
      required: true,
    },

    /** Display name shown to customers */
    name: {
      type: String,
      required: true,
    },

    /** Image URL for frontend display */
    image: {
      type: String,
      required: true,
    },

    /** Maximum passenger capacity */
    capacity: {
      type: Number,
      required: true,
    },

    /** Maximum luggage capacity */
    luggage: {
      type: Number,
      required: true,
    },

    /** Pricing rules */
    pricePerHour: {
      type: Number,
      required: true,
    },
    pricePermile: {
      type: Number,
      required: true,
    },

    /** Minimum charge per booking */
    minprice: {
      type: Number,
      required: true,
    },

    /** Minimum billable hours for hourly trips */
    minHours: {
      type: Number,
      required: true,
    },

    /**
     * Global availability flag
     * (does NOT account for bookings overlap)
     */
    isAvailable: {
      type: Boolean,
      default: true,
    },

    /**
     * Number of identical cars available
     * Used to avoid overbooking
     */
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },

    /**
     * Operational status
     * - active: bookable
     * - retired: hidden and unbookable
     */
    status: {
      type: String,
      enum: ["active", "retired"],
      default: "active",
    },
  },
  {
    /** Adds createdAt and updatedAt */
    timestamps: true,
  },
);

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);
export default Car;
