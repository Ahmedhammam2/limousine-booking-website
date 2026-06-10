import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import {
  getDateRanges,
  calculateGrowth,
} from "@/lib/adminAnalytics/dateHelpers";

/**
    GET /api/admin/analytics/revenue
    Returns net revenue metrics for different time periods
    Includes growth percentages compared to previous periods
 */
export async function GET(request) {
  try {
    await connectDB();

    // Get all date ranges needed for filtering (Normalized to UTC)
    const ranges = getDateRanges();
    const dateQueryStrings = {
      thisWeek: { start: ranges.thisWeek.start.toISOString().split('T')[0], end: ranges.thisWeek.end.toISOString().split('T')[0] },
      thisMonth: { start: ranges.thisMonth.start.toISOString().split('T')[0], end: ranges.thisMonth.end.toISOString().split('T')[0] },
      thisYear: { start: ranges.thisYear.start.toISOString().split('T')[0], end: ranges.thisYear.end.toISOString().split('T')[0] },
    };

    console.log("Analytics Debug - Date Queries:", dateQueryStrings);

    const commonMatchFields = {
      paymentStatus: { $in: ["paid", "pending", "unpaid"] },
      status: { $in: ["pending", "confirmed", "no show"] },
    };

    // Helper for safe price summation with date matching
    const getRevenueForPeriod = async (start, end) => {
      const qStart = start instanceof Date ? start.toISOString().split('T')[0] : start;
      const qEnd = end instanceof Date ? end.toISOString().split('T')[0] : end;
      
      const res = await Booking.aggregate([
        {
          $match: {
            $or: [
              { date: { $gte: start, $lte: end } },
              { date: { $gte: qStart, $lte: qEnd } }
            ],
            ...commonMatchFields
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $convert: { input: "$finalPrice", to: "double", onError: 0, onNull: 0 } } },
          }
        }
      ]);
      return res[0]?.total || 0;
    };

    const currentWeek = await getRevenueForPeriod(ranges.thisWeek.start, ranges.thisWeek.end);
    const currentMonth = await getRevenueForPeriod(ranges.thisMonth.start, ranges.thisMonth.end);
    const currentYear = await getRevenueForPeriod(ranges.thisYear.start, ranges.thisYear.end);
    const yesterday = await getRevenueForPeriod(ranges.yesterday.start, ranges.yesterday.end);

    const previousWeek = await getRevenueForPeriod(ranges.lastWeek.start, ranges.lastWeek.end);
    const previousMonth = await getRevenueForPeriod(ranges.lastMonth.start, ranges.lastMonth.end);
    const previousYear = await getRevenueForPeriod(ranges.lastYear.start, ranges.lastYear.end);

    /**
      Calculate growth percentages
      Positive = revenue increased
      Negative = revenue decreased
     */
    const weekGrowth = calculateGrowth(currentWeek, previousWeek);
    const monthGrowth = calculateGrowth(currentMonth, previousMonth);
    const yearGrowth = calculateGrowth(currentYear, previousYear);

    return NextResponse.json({
      thisWeek: currentWeek,
      thisMonth: currentMonth,
      thisYear: currentYear,
      yesterday,
      weekGrowth,
      monthGrowth,
      yearGrowth,
    });
  } catch (error) {
    console.error("Revenue metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue metrics" },
      { status: 500 },
    );
  }
}
