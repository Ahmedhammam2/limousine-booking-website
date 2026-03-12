"use client";

import { useState } from "react";
import RevenueMetrics from "@/components/admin/analytics/RevenueMetrics";
import BookingHealth from "@/components/admin/analytics/BookingHealth";
import FleetPerformance from "@/components/admin/analytics/FleetPerformance";
import TimeHeatmap from "@/components/admin/analytics/TimeHeatmap";
import RevenueTrend from "@/components/admin/analytics/RevenueTrend";
import TripTypeMetrics from "@/components/admin/analytics/TripTypeMetrics";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("month");

  const tabs = [
    { id: "overview", label: "Revenue Overview" },
    { id: "fleet", label: "Fleet Performance" },
    { id: "service", label: "Service Intelligence" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container with responsive padding
          px-4: 16px on mobile
          sm:px-6: 24px on small screens and up
          lg:px-8: 32px on large screens and up
          py-4: 16px vertical on mobile
          sm:py-6: 24px vertical on small screens
          lg:py-8: 32px vertical on large screens
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page header - responsive text sizes */}
        <div className="mb-6 sm:mb-8">
          {/* text-2xl (24px) on mobile, text-3xl (30px) on desktop */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Monitor your limousine business performance in real-time
          </p>
        </div>

        {/* Navigation section - stacks vertically on mobile, horizontal on desktop */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tab buttons - horizontal scroll on mobile if needed */}
          <div className="flex space-x-1 bg-white rounded-lg border border-gray-200 p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                // Responsive text: text-xs on mobile, text-sm on larger screens
                // whitespace-nowrap prevents text wrapping
                // px-3 on mobile, px-4 on larger screens
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Period selector - full width on mobile, auto width on larger screens */}
          <div className="flex space-x-1 bg-white rounded-lg border border-gray-200 p-1 w-full sm:w-auto">
            <button
              onClick={() => setPeriod("week")}
              // flex-1 makes buttons equal width on mobile
              className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                period === "week"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                period === "month"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                period === "year"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Tab content - all components are responsive by default */}
        {activeTab === "overview" && (
          // space-y-6 on mobile, space-y-8 on larger (vertical spacing)
          <div className="space-y-6 sm:space-y-8">
            <RevenueMetrics />
            <RevenueTrend />
            <BookingHealth period={period === "year" ? "month" : period} />
          </div>
        )}

        {activeTab === "fleet" && (
          <div className="space-y-6 sm:space-y-8">
            <FleetPerformance period={period} />
          </div>
        )}

        {activeTab === "service" && (
          <div className="space-y-6 sm:space-y-8">
            <TripTypeMetrics period={period} />
            <TimeHeatmap period={period} />
          </div>
        )}
      </div>
    </div>
  );
}
