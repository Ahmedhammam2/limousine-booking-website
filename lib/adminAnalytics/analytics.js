/**
  Determine if a booking should count toward revenue
  Revenue only counts when:
  1. Payment status is "paid"
  2. Booking is not canceled
  Note: "no show" bookings count if paid (industry standard)
 */
export function isRevenueBooking(status, paymentStatus) {
  // Must be paid to count as revenue
  if (paymentStatus !== "paid") return false;

  // Canceled bookings don't count even if paid (should be refunded)
  if (status === "canceled") return false;

  // All other paid bookings count (including no-shows)
  return true;
}

/**
  Determine if a booking is a confirmed trip
  Used for operational metrics
 */
export function isConfirmedTrip(status) {
  return status === "confirmed";
}

/**
  Calculate utilization status based on rate
  Healthy: 50%+ utilization
  Monitor: 40-50% utilization
  Warning: 30-40% utilization
  Critical: Below 30% utilization
 */
export function getUtilizationStatus(utilizationRate) {
  if (utilizationRate >= 50) return "healthy";
  if (utilizationRate >= 40) return "monitor";
  if (utilizationRate >= 30) return "warning";
  return "critical";
}

/**
  Calculate total available hours for a car in a date range
  Assumes 12 operating hours per day (6 AM - 6 PM)
  Multiplies by car quantity to get total fleet capacity
 */
export function calculateAvailableHours(
  startDate,
  endDate,
  carQuantity,
  operatingHoursPerDay = 24,
) {
  // Calculate time difference in milliseconds
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());

  // Convert milliseconds to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Return total available hours
  return diffDays * operatingHoursPerDay * carQuantity;
}

/**
  Determine alert level based on metric thresholds
  Returns null if value is within acceptable range
  Returns 'warning' or 'critical' if thresholds exceeded
 */
export function getAlertLevel(metric, value) {
  const thresholds = {
    noShowRate: { critical: 0.1, warning: 0.05 }, // 10% critical, 5% warning
    cancellationRate: { critical: 0.2, warning: 0.15 }, // 20% critical, 15% warning
    utilizationRate: { critical: 0.2, warning: 0.3 }, // Below 20% critical, below 30% warning
    refundRate: { critical: 0.1, warning: 0.06 }, // 10% critical, 6% warning
  };

  const threshold = thresholds[metric];
  if (!threshold) return null;

  if (value >= threshold.critical) return "critical";
  if (value >= threshold.warning) return "warning";
  return null;
}
