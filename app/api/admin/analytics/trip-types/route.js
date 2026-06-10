import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getDateRanges } from "@/lib/adminAnalytics/dateHelpers";

/**
 GET /api/admin/analytics/trip-types?period=month
 Returns metrics for transfer vs hourly trips
 Includes count, revenue, and average duration for each type
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    await connectDB();
    // Use UTC-normalized ranges for period filtering
    const ranges = getDateRanges();

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
      Aggregate by trip type to get metrics for each
     */
    const tripTypeData = await Booking.aggregate([
      {
        $match: {
          $or: [
            { date: { $gte: startDate, $lte: endDate } },
            { date: { $gte: startDate.toISOString().split('T')[0], $lte: endDate.toISOString().split('T')[0] } }
          ],
          status: { $in: ["pending", "confirmed", "no show"] },
        },
      },
      {
        $addFields: {
          /**
              Calculate duration in hours
              endTime - startTime gives milliseconds
              convert to hours
             */
          durationHours: {
            $divide: [{ $subtract: ["$endTime", "$startTime"] }, 3600000],
          },
          /**
              Only include revenue for paid bookings
              Unpaid bookings contribute 0 to revenue
             */
          revenueAmount: {
            $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$finalPrice", 0],
          },
        },
      },
      {
        $group: {
          _id: "$tripType", // Group by 'transfer' or 'hourly'
          count: { $sum: 1 },
          revenue: { $sum: "$revenueAmount" },
          avgDuration: { $avg: "$durationHours" },
        },
      },
    ]);

    /**
      Extract transfer and hourly data
      Provide defaults if type doesn't exist in data
     */
    const transfer = tripTypeData.find((t) => t._id === "transfer") || {
      count: 0,
      revenue: 0,
      avgDuration: 0,
    };

    const hourly = tripTypeData.find((t) => t._id === "hourly") || {
      count: 0,
      revenue: 0,
      avgDuration: 0,
    };

    /**
     Format response with calculated averages
     avgRevenue = total revenue / number of bookings
     */
    return NextResponse.json({
      transfer: {
        count: transfer.count,
        revenue: transfer.revenue,
        avgRevenue: transfer.count > 0 ? transfer.revenue / transfer.count : 0,
        avgDuration: transfer.avgDuration || 0,
      },
      hourly: {
        count: hourly.count,
        revenue: hourly.revenue,
        avgRevenue: hourly.count > 0 ? hourly.revenue / hourly.count : 0,
        avgDuration: hourly.avgDuration || 0,
      },
    });
  } catch (error) {
    console.error("Trip type metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip type metrics" },
      { status: 500 },
    );
  }
}
