"use client";

import { useEffect, useState } from "react";
import MetricCard from "./MetricCard";

/**
 * RevenueMetrics Component
 * Displays revenue overview cards for different time periods
 * Fetches data from /api/analytics/revenue
 */
export default function RevenueMetrics({ period }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch revenue metrics when period changes
   */
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching revenue metrics for ${period}...`);
        const response = await fetch(`/api/admin/analytics/revenue?period=${period}`);
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Revenue fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [period]);

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-red-500 text-sm">
        <p className="font-bold mb-1">Analytics Error</p>
        <p>{error}. Check if your database connection is working correctly.</p>
      </div>
    );
  }

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
