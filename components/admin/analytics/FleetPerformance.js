"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/adminAnalytics/dateHelpers";

/**
 * FleetPerformance Component
 * Shows top performing cars by bookings and revenue
 *
 * Props:
 * - period: Time period for data ('week', 'month', 'year')
 */
export default function FleetPerformance({ period }) {
  const [topByBookings, setTopByBookings] = useState([]);
  const [topByRevenue, setTopByRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFleetData() {
      try {
        const response = await fetch(
          `/api/admin/analytics/fleet?period=${period}`,
        );
        const data = await response.json();
        setTopByBookings(data.topByBookings);
        setTopByRevenue(data.topByRevenue);
      } catch (error) {
        console.error("Failed to fetch fleet data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFleetData();
  }, [period]);

  if (loading) {
    return <div className="bg-gray-100 rounded-lg h-96 animate-pulse" />;
  }

  /**
   * Get status badge color based on utilization status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "monitor":
        return "text-blue-600 bg-blue-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Top Performers
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 3 by bookings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            By Bookings
          </h4>
          <div className="space-y-4">
            {topByBookings.map((car, index) => (
              <div key={car.carId} className="flex items-start gap-4">
                {/* Rank badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {index + 1}
                </div>

                {/* Car details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {car.carName}
                  </p>
                  <p className="text-xs text-gray-500">{car.carType}</p>

                  {/* Metrics */}
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm text-gray-900 font-medium">
                      {car.bookingCount} bookings
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(car.status)}`}
                    >
                      {car.utilizationRate.toFixed(0)}% util
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 by revenue */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">By Revenue</h4>
          <div className="space-y-4">
            {topByRevenue.map((car, index) => (
              <div key={car.carId} className="flex items-start gap-4">
                {/* Rank badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {index + 1}
                </div>

                {/* Car details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {car.carName}
                  </p>
                  <p className="text-xs text-gray-500">{car.carType}</p>

                  {/* Metrics */}
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm text-gray-900 font-medium">
                      {formatCurrency(car.revenue)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(car.status)}`}
                    >
                      {car.utilizationRate.toFixed(0)}% util
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
