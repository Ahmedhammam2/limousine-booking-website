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
      case "year":
        startDate = ranges.thisYear.start;
        endDate = ranges.thisYear.end;
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
    const confirmedResult = await Booking.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, startDate.toISOString().split('T')[0]] },
              { $lte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, endDate.toISOString().split('T')[0]] },
              { $eq: ["$status", "confirmed"] }
            ]
          }
        },
      },
      { $count: "count" },
    ]);
    const confirmed = confirmedResult[0]?.count || 0;

    /**
      Count canceled bookings
     */
    const canceledResult = await Booking.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, startDate.toISOString().split('T')[0]] },
              { $lte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, endDate.toISOString().split('T')[0]] },
              { $eq: ["$status", "canceled"] }
            ]
          }
        },
      },
      { $count: "count" },
    ]);
    const canceled = canceledResult[0]?.count || 0;

    /**
      Count no-show bookings
     */
    const noShowsResult = await Booking.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, startDate.toISOString().split('T')[0]] },
              { $lte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, endDate.toISOString().split('T')[0]] },
              { $eq: ["$status", "no show"] }
            ]
          }
        },
      },
      { $count: "count" },
    ]);
    const noShows = noShowsResult[0]?.count || 0;

    /**
      Count pending bookings
     */
    const pendingResult = await Booking.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, startDate.toISOString().split('T')[0]] },
              { $lte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, endDate.toISOString().split('T')[0]] },
              { $eq: ["$status", "pending"] }
            ]
          }
        },
      },
      { $count: "count" },
    ]);
    const pending = pendingResult[0]?.count || 0;

    /**
      Calculate operational rates
     */
    const totalTrips = confirmed + canceled + noShows + pending;
    const completionRate = totalTrips > 0 ? (confirmed / totalTrips) * 100 : 0;
    const cancellationRate = totalTrips > 0 ? (canceled / totalTrips) * 100 : 0;
    const noShowRate = totalTrips > 0 ? (noShows / totalTrips) * 100 : 0;

    return NextResponse.json({
      created,
      confirmed,
      pending,
      canceled,
      noShows,
      completionRate,
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
