import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import {
  getDateRanges,
  getDayName,
  isPeakTime,
} from "@/lib/adminAnalytics/dateHelpers";

/**
  GET /api/analytics/time-intelligence?period=month
  Returns time-based booking patterns
  Includes hourly, daily, and peak vs off-peak metrics
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    await connectDB();
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
      Get hourly distribution of bookings
      Shows which hours of the day are busiest
     */
    const hourlyData = await Booking.aggregate([
      {
        $match: {
          $or: [
            { date: { $gte: startDate, $lte: endDate } },
            { date: { $gte: startDate.toISOString().split('T')[0], $lte: endDate.toISOString().split('T')[0] } }
          ],
          status: { $in: ["pending", "confirmed", "no show"] },
          startTime: { $exists: true },
        },
      },
      {
        $group: {
          _id: { $hour: "$startTime" }, // Extract hour (0-23)
          bookingCount: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$finalPrice", 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format hourly data with average revenue per booking
    const hourlyDistribution = hourlyData.map((h) => ({
      hour: h._id,
      bookingCount: h.bookingCount,
      avgRevenue: h.bookingCount > 0 ? h.totalRevenue / h.bookingCount : 0,
    }));

    /**
    Get daily distribution of bookings
    Shows which days of the week are busiest
     
     */
    const dailyData = await Booking.aggregate([
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
        $group: {
          _id: { $dayOfWeek: "$date" },
          bookingCount: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$finalPrice", 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    /**
      Format daily data with day names
      MongoDB's dayOfWeek starts at 1 (Sunday), but getDayName expects 0-6
     */
    const dailyDistribution = dailyData.map((d) => ({
      dayOfWeek: d._id,
      dayName: getDayName(d._id === 1 ? 0 : d._id - 1),
      bookingCount: d.bookingCount,
      revenue: d.revenue,
    }));

    /**
      Calculate peak vs off-peak metrics
      Need to check each booking individually against peak time rules
     */
    const allBookings = await Booking.find({
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: "canceled" },
      startTime: { $exists: true },
    });

    // Initialize counters
    let peakBookings = 0;
    let offPeakBookings = 0;
    let peakRevenue = 0;
    let offPeakRevenue = 0;

    // Iterate through bookings to classify as peak or off-peak
    allBookings.forEach((booking) => {
      const isPeak = isPeakTime(new Date(booking.startTime));
      const revenue = booking.paymentStatus === "paid" ? booking.finalPrice : 0;

      if (isPeak) {
        peakBookings++;
        peakRevenue += revenue;
      } else {
        offPeakBookings++;
        offPeakRevenue += revenue;
      }
    });

    // Calculate average prices for peak vs off-peak
    const avgPeakPrice = peakBookings > 0 ? peakRevenue / peakBookings : 0;
    const avgOffPeakPrice =
      offPeakBookings > 0 ? offPeakRevenue / offPeakBookings : 0;

    return NextResponse.json({
      hourlyDistribution,
      dailyDistribution,
      peakMetrics: {
        peakBookings,
        offPeakBookings,
        peakRevenue,
        offPeakRevenue,
        avgPeakPrice,
        avgOffPeakPrice,
      },
    });
  } catch (error) {
    console.error("Time intelligence error:", error);
    return NextResponse.json(
      { error: "Failed to fetch time intelligence data" },
      { status: 500 },
    );
  }
}
