"use client";

import { useEffect, useState } from "react";

/**
 * BookingHealth Component
 * Displays booking funnel metrics and health indicators
 * Shows created, confirmed, canceled, and no-show counts with rates
 *
 * Props:
 * - period: 'week' or 'month' to control date range
 */
export default function BookingHealth({ period }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch booking health data when period changes
   */
  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await fetch(
          `/api/admin/analytics/bookings?period=${period}`,
        );
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error("Failed to fetch booking health:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
  }, [period]);

  if (loading) {
    return <div className="bg-gray-100 rounded-lg h-48 animate-pulse" />;
  }

  if (!health) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load booking health
      </div>
    );
  }

  /**
   * Determine if metrics exceed alert thresholds
   * No-show rate should be below 5%
   * Cancellation rate should be below 15%
   */
  const noShowAlert = health.noShowRate > 5;
  const cancellationAlert = health.cancellationRate > 15;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Booking Health
      </h3>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total bookings created */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Created</p>
          <p className="text-2xl font-semibold text-gray-900">
            {health.created}
          </p>
        </div>

        {/* Confirmed trips */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Confirmed</p>
          <p className="text-2xl font-semibold text-gray-900">
            {health.confirmed}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {health.confirmationRate.toFixed(1)}%
          </p>
        </div>

        {/* Canceled bookings */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Canceled</p>
          <p className="text-2xl font-semibold text-gray-900">
            {health.canceled}
          </p>
          <p
            className={`text-xs mt-1 ${
              cancellationAlert ? "text-red-600" : "text-gray-500"
            }`}
          >
            {health.cancellationRate.toFixed(1)}%
          </p>
        </div>

        {/* No-shows */}
        <div>
          <p className="text-sm text-gray-600 mb-1">No-Shows</p>
          <p className="text-2xl font-semibold text-gray-900">
            {health.noShows}
          </p>
          <p
            className={`text-xs mt-1 ${
              noShowAlert ? "text-red-600" : "text-gray-500"
            }`}
          >
            {health.noShowRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Alert section - only shows if thresholds exceeded */}
      {(noShowAlert || cancellationAlert) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Alerts:</p>
          <ul className="space-y-1">
            {noShowAlert && (
              <li className="text-sm text-red-600">
                No-show rate elevated ({health.noShowRate.toFixed(1)}% vs 3%
                target)
              </li>
            )}
            {cancellationAlert && (
              <li className="text-sm text-red-600">
                Cancellation rate high ({health.cancellationRate.toFixed(1)}% vs
                10% target)
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
