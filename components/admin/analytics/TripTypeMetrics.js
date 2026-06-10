"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/adminAnalytics/dateHelpers";

/**
 * TripTypeMetrics Component
 * Compares transfer vs hourly trip performance
 *
 * Props:
 * - period: Time period for data ('week', 'month', 'year')
 */
export default function TripTypeMetrics({ period }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch(
          `/api/admin/analytics/trip-types?period=${period}`,
        );
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch trip type metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [period]);

  if (loading) {
    return <div className="bg-gray-100 rounded-lg h-64 animate-pulse" />;
  }

  if (!metrics) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load trip type metrics
      </div>
    );
  }

  /**
   * Calculate total bookings for percentage calculations
   */
  const totalBookings = metrics.transfer.count + metrics.hourly.count;
  const transferPercent =
    totalBookings > 0 ? (metrics.transfer.count / totalBookings) * 100 : 0;
  const hourlyPercent =
    totalBookings > 0 ? (metrics.hourly.count / totalBookings) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Revenue by Trip Type</h2>
        <p className="text-sm text-gray-500">Includes all booking types (Paid & Pending)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer trips */}
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Transfer</h4>
            <span className="text-xs text-gray-500">
              {transferPercent.toFixed(0)}% of bookings
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600">Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.transfer.count}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Revenue</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(metrics.transfer.revenue)}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600">Avg Revenue</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(metrics.transfer.avgRevenue)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600">Avg Duration</p>
                <p className="text-sm font-medium text-gray-900">
                  {metrics.transfer.avgDuration.toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly trips */}
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Hourly</h4>
            <span className="text-xs text-gray-500">
              {hourlyPercent.toFixed(0)}% of bookings
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600">Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.hourly.count}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Revenue</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(metrics.hourly.revenue)}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600">Avg Revenue</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(metrics.hourly.avgRevenue)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600">Avg Duration</p>
                <p className="text-sm font-medium text-gray-900">
                  {metrics.hourly.avgDuration.toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insight section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {metrics.hourly.avgRevenue > metrics.transfer.avgRevenue ? (
            <span>
              Hourly bookings generate{" "}
              <span className="font-semibold text-gray-900">
                {formatCurrency(
                  metrics.hourly.avgRevenue - metrics.transfer.avgRevenue,
                )}
              </span>{" "}
              more per booking. Consider promoting hourly packages.
            </span>
          ) : (
            <span>
              Transfer bookings are your core business at{" "}
              <span className="font-semibold text-gray-900">
                {transferPercent.toFixed(0)}%
              </span>{" "}
              of total bookings.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
