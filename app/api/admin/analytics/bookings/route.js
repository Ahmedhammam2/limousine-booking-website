import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getDateRanges } from "@/lib/adminAnalytics/dateHelpers";

/**
 * GET /api/admin/analytics/bookings?period=month
 * Returns booking health metrics (created, confirmed, canceled, no-shows)
 * Includes conversion rates for operational tracking
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    await connectDB();

    const ranges = getDateRanges();

    /**
     * Determine date range based on period
     */
    let startDate;
    let endDate;

    switch (period) {
      case "week":
        startDate = ranges.thisWeek.start;
        endDate = ranges.thisWeek.end;
        break;
      default:
        startDate = ranges.thisMonth.start;
        endDate = ranges.thisMonth.end;
    }

    /**
     * Count bookings created in this period
     * Uses createdAt timestamp (when booking was made)
     * This measures sales/demand generation
     */
    const created = await Booking.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    /**
     Count confirmed trips in this period
      Uses date field (when trip occurred)
     */
    const confirmed = await Booking.countDocuments({
      date: { $gte: startDate, $lte: endDate },
      status: "confirmed",
    });

    /**
      Count canceled bookings
     */
    const canceled = await Booking.countDocuments({
      date: { $gte: startDate, $lte: endDate },
      status: "canceled",
    });

    /**
      Count no-show bookings
     */
    const noShows = await Booking.countDocuments({
      date: { $gte: startDate, $lte: endDate },
      status: "no show",
    });

    /**
      Calculate operational rates
     */
    const totalTrips = confirmed + canceled + noShows;
    const confirmationRate =
      totalTrips > 0 ? (confirmed / totalTrips) * 100 : 0;
    const cancellationRate = totalTrips > 0 ? (canceled / totalTrips) * 100 : 0;
    const noShowRate = totalTrips > 0 ? (noShows / totalTrips) * 100 : 0;

    return NextResponse.json({
      created,
      confirmed,
      canceled,
      noShows,
      confirmationRate,
      cancellationRate,
      noShowRate,
    });
  } catch (error) {
    console.error("Booking metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking metrics" },
      { status: 500 },
    );
  }
}
