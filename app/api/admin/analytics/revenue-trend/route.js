import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import {
  getDateRanges,
  calculateGrowth,
  getMonthName,
} from "@/lib/adminAnalytics/dateHelpers";

/**
  GET /api/admin/analytics/revenue-trend
  Returns monthly revenue data for the last 6 months
  Includes month-over-month growth rates
 */
export async function GET(request) {
  try {
    await connectDB();
    const ranges = getDateRanges();

    /**
      Aggregate revenue by month for the last 6 months
      Group by year and month to handle year transitions
     */
    const monthlyData = await Booking.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, ranges.sixMonthsAgo.toISOString().split('T')[0]] },
              { $lte: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } }, ranges.thisMonth.end.toISOString().split('T')[0]] },
              { $in: ["$paymentStatus", ["paid", "pending", "unpaid"]] },
              { $in: ["$status", ["pending", "confirmed", "no show"]] }
            ]
          }
        },
      },
      {
        $group: {
          _id: {
            year: { $year: { $toDate: "$date" } },
            month: { $month: { $toDate: "$date" } }, // 1-12
          },
          revenue: { $sum: { $convert: { input: "$finalPrice", to: "double", onError: 0, onNull: 0 } } },
          bookingCount: { $sum: 1 },
        },
      },
      {
        // Sort chronologically
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    /**
      Calculate month-over-month growth rates
      First month has no previous data, so growth is 0
     */
    const trendData = monthlyData.map((data, index) => {
      const previousRevenue = index > 0 ? monthlyData[index - 1].revenue : 0;
      const growthRate = calculateGrowth(data.revenue, previousRevenue);

      return {
        month: getMonthName(data._id.month - 1), // Convert 1-12 to 0-11 for getMonthName
        year: data._id.year,
        revenue: data.revenue,
        bookingCount: data.bookingCount,
        growthRate: index > 0 ? growthRate : 0, // No growth for first month
      };
    });

    return NextResponse.json(trendData);
  } catch (error) {
    console.error("Revenue trend error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue trend" },
      { status: 500 },
    );
  }
}
