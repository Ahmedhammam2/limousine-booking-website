"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/adminAnalytics/dateHelpers";

/**
 * RevenueTrend Component
 * Displays 6-month revenue trend with month-over-month growth
 * Simple bar chart visualization
 */
export default function RevenueTrend() {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrend() {
      try {
        const response = await fetch("/api/admin/analytics/revenue-trend");
        const data = await response.json();
        setTrendData(data);
      } catch (error) {
        console.error("Failed to fetch revenue trend:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrend();
  }, []);

  if (loading) {
    return <div className="bg-gray-100 rounded-lg h-64 animate-pulse" />;
  }

  if (trendData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No trend data available
      </div>
    );
  }

  /**
   * Find maximum revenue for scaling bars
   */
  const maxRevenue = Math.max(...trendData.map((d) => d.revenue));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Revenue Trend (Last 6 Months)
      </h3>

      {/* Bar chart */}
      <div className="space-y-4">
        {trendData.map((data) => {
          /**
           * Calculate bar width as percentage of max
           */
          const barWidth = (data.revenue / maxRevenue) * 100;

          /**
           * Determine growth indicator color
           */
          const growthColor =
            data.growthRate >= 0 ? "text-green-600" : "text-red-600";

          return (
            <div key={`${data.month}-${data.year}`} className="space-y-2">
              {/* Month label and revenue */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {data.month} {data.year}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(data.revenue)}
                  </span>
                  {data.growthRate !== 0 && (
                    <span className={`text-xs font-medium ${growthColor}`}>
                      {data.growthRate > 0 ? "+" : ""}
                      {data.growthRate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Booking count */}
              <p className="text-xs text-gray-500">
                {data.bookingCount} bookings
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
