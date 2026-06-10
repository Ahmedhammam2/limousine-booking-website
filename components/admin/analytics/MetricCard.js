"use client";

import {
  formatCurrency,
  formatPercentage,
} from "@/lib/adminAnalytics/dateHelpers";
/**
 * MetricCard Component - NOW FULLY RESPONSIVE
 *
 * Responsive breakpoints:
 * - Mobile (< 640px): Full width, compact padding
 * - Tablet (640px - 1024px): 2 columns
 * - Desktop (> 1024px): 4 columns
 */
export default function MetricCard({
  title,
  value,
  growth,
  format = "number",
  subtitle,
}) {
  const formattedValue =
    format === "currency"
      ? formatCurrency(value)
      : format === "percentage"
        ? `${value.toFixed(1)}%`
        : value.toLocaleString();

  const growthColor = growth
    ? growth >= 0
      ? "text-green-600"
      : "text-red-600"
    : "text-gray-500";

  return (
    // Added responsive padding: p-4 on mobile (16px), p-6 on larger screens (24px)
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Font size responsive: text-xs on mobile, text-sm on larger */}
          <p className="text-xs sm:text-sm font-medium text-gray-600">
            {title}
          </p>

          {/* Value and growth indicator */}
          <div className="mt-2 flex items-baseline flex-wrap gap-2">
            {/* Font size: 2xl on mobile (24px), 3xl on desktop (30px) */}
            <p className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {formattedValue}
            </p>
            {growth !== undefined && (
              <span className={`text-xs sm:text-sm font-medium ${growthColor}`}>
                {formatPercentage(growth)}
              </span>
            )}
          </div>

          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
