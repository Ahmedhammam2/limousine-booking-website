"use client";

import { useEffect, useState } from "react";

export default function TimeHeatmap({ period }) {
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeData() {
      try {
        const response = await fetch(
          `/api/admin/analytics/time-intelligence?period=${period}`,
        );
        const data = await response.json();
        setHourlyData(data.hourlyDistribution);
        setDailyData(data.dailyDistribution);
      } catch (error) {
        console.error("Failed to fetch time intelligence data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTimeData();
  }, [period]);

  if (loading) {
    return <div className="bg-gray-100 rounded-lg h-96 animate-pulse" />;
  }

  const maxHourlyBookings = Math.max(
    ...hourlyData.map((h) => h.bookingCount),
    1,
  );
  const maxDailyBookings = Math.max(...dailyData.map((d) => d.bookingCount), 1);

  const getColorIntensity = (count, max) => {
    const intensity = (count / max) * 100;
    if (intensity === 0) return "bg-gray-100";
    if (intensity < 25) return "bg-blue-200";
    if (intensity < 50) return "bg-blue-400";
    if (intensity < 75) return "bg-blue-600";
    return "bg-blue-800";
  };

  return (
    // Responsive padding
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
        Booking Patterns
      </h3>

      {/* Hourly distribution - NOW WITH HORIZONTAL SCROLL ON MOBILE */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">
          Busiest Hours (24-Hour Operations)
        </h4>

        {/* Wrapper with horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-2">
          {/* min-w-max prevents compression, allows scrolling
              grid-cols-24 creates 24 equal columns for 24 hours
              gap-1 on mobile, gap-2 on larger screens
          */}
          <div className="grid grid-cols-24 gap-1 sm:gap-2 min-w-max sm:min-w-0">
            {hourlyData.map((hour) => (
              <div
                key={hour.hour}
                className="text-center min-w-[32px] sm:min-w-0"
              >
                {/* Height: h-12 on mobile (48px), h-16 on larger (64px) */}
                <div
                  className={`h-12 sm:h-16 rounded ${getColorIntensity(hour.bookingCount, maxHourlyBookings)}`}
                  title={`${hour.hour}:00 - ${hour.bookingCount} bookings`}
                />
                {/* Font size: text-[10px] on mobile (very small), text-xs on larger */}
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {hour.hour}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile scroll hint */}
        <p className="text-[10px] sm:text-xs text-gray-400 mt-2 sm:hidden">
          Swipe to see all hours
        </p>
      </div>

      {/* Daily distribution - grid automatically responsive */}
      <div>
        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">
          Busiest Days
        </h4>
        {/* grid-cols-7 works on all screens (7 days fit nicely) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {dailyData.map((day) => (
            <div key={day.dayOfWeek} className="text-center">
              {/* Height: h-16 on mobile (64px), h-24 on larger (96px) */}
              <div
                className={`h-16 sm:h-24 rounded ${getColorIntensity(day.bookingCount, maxDailyBookings)} flex items-center justify-center`}
              >
                {/* Font size: text-sm on mobile, text-base on larger */}
                <span className="text-sm sm:text-base text-white font-semibold">
                  {day.bookingCount}
                </span>
              </div>
              {/* Font size: text-[10px] on mobile, text-xs on larger */}
              <p className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-2 font-medium">
                {day.dayName.slice(0, 3)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        <p className="text-[10px] sm:text-xs text-gray-500">
          Darker colors indicate higher booking volume
        </p>
      </div>
    </div>
  );
}
