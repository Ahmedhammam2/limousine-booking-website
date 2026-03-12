"use client";

import { useEffect, useState } from "react";
import MetricCard from "./MetricCard";

/**
 * RevenueMetrics Component
 * Displays revenue overview cards for different time periods
 * Fetches data from /api/analytics/revenue
 */
export default function RevenueMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch revenue metrics on component mount
   */
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/admin/analytics/revenue");
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch revenue metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  /**
   * Show loading skeleton while fetching
   */
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  /**
   * Show error message if fetch failed
   */
  if (!metrics) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load revenue metrics
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Revenue Overview</h2>

      {/* Grid of metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="This Week"
          value={metrics.thisWeek}
          growth={metrics.weekGrowth}
          format="currency"
        />

        <MetricCard
          title="This Month"
          value={metrics.thisMonth}
          growth={metrics.monthGrowth}
          format="currency"
        />

        <MetricCard
          title="This Year"
          value={metrics.thisYear}
          growth={metrics.yearGrowth}
          format="currency"
        />

        <MetricCard
          title="Yesterday"
          value={metrics.yesterday}
          format="currency"
          subtitle="Daily snapshot"
        />
      </div>
    </div>
  );
}
