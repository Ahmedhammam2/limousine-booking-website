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

    // Get all date ranges needed for filtering
    const ranges = getDateRanges();

    /**
     Calculate revenue for this week
     Only count bookings where:
     - Payment status is "paid"
     - Status is not "canceled"
     */
    const thisWeekRevenue = await Booking.aggregate([
      {
        $match: {
          date: { $gte: ranges.thisWeek.start, $lte: ranges.thisWeek.end },
          paymentStatus: "paid",
          status: { $ne: "canceled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" },
        },
      },
    ]);

    // Calculate revenue for this month
    const thisMonthRevenue = await Booking.aggregate([
      {
        $match: {
          date: { $gte: ranges.thisMonth.start, $lte: ranges.thisMonth.end },
          paymentStatus: "paid",
          status: { $ne: "canceled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" },
        },
      },
    ]);

    //  Calculate revenue for this year
    const thisYearRevenue = await Booking.aggregate([
      {
        $match: {
          date: { $gte: ranges.thisYear.start, $lte: ranges.thisYear.end },
          paymentStatus: "paid",
          status: { $ne: "canceled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" },
        },
      },
    ]);

    /**
      Calculate revenue for yesterday
      Used as a daily snapshot metric
     */
    const yesterdayRevenue = await Booking.aggregate([
      {
        $match: {
          date: { $gte: ranges.yesterday.start, $lte: ranges.yesterday.end },
          paymentStatus: "paid",
          status: { $ne: "canceled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" },
        },
      },
    ]);

    //  Calculate previous periods for growth comparison (week, month, year)
    const lastWeekRevenue = await Booking.aggregate([
      {
        $match: {
          date: { $gte: ranges.lastWeek.start, $lte: ranges.lastWeek.end },
          paymentStatus: "paid",
          status: { $ne: "canceled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" },
        },
      },
    ]);

    const lastMonthRevenue = await Booking.aggregate([
      {
        $match: {
          date: { $gte: ranges.lastMonth.start, $lte: ranges.lastMonth.end },
          paymentStatus: "paid",
          status: { $ne: "canceled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" },
        },
      },
    ]);

    const lastYearRevenue = await Booking.aggregate([
      {
        $match: {
          date: { $gte: ranges.lastYear.start, $lte: ranges.lastYear.end },
          paymentStatus: "paid",
          status: { $ne: "canceled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" },
        },
      },
    ]);

    /**
      Extract values from aggregation results
      Use 0 as fallback if no data exists for that period
     */
    const currentWeek = thisWeekRevenue[0]?.total || 0;
    const currentMonth = thisMonthRevenue[0]?.total || 0;
    const currentYear = thisYearRevenue[0]?.total || 0;
    const yesterday = yesterdayRevenue[0]?.total || 0;

    const previousWeek = lastWeekRevenue[0]?.total || 0;
    const previousMonth = lastMonthRevenue[0]?.total || 0;
    const previousYear = lastYearRevenue[0]?.total || 0;

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
