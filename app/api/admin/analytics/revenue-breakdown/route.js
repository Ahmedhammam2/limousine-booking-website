import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getDateRanges } from "@/lib/adminAnalytics/dateHelpers";

/**
  GET /api/admin/analytics/revenue-breakdown?period=month
  Returns gross vs net revenue comparison
  Shows impact of refunds on total revenue
 */
export async function GET(request) {
  try {
    // Extract period from query parameters (default to 'month')
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    await connectDB();
    const ranges = getDateRanges();

    /**
      Determine date range based on requested period
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
      default: // 'month'
        startDate = ranges.thisMonth.start;
        endDate = ranges.thisMonth.end;
    }

    /**
      Use $facet to calculate gross and net in one query
      Gross revenue = paid + refunded (total collected before refunds)
      Net revenue = paid only (actual money kept)
     */
    const result = await Booking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $ne: "canceled" }, // Exclude canceled bookings
        },
      },
      {
        $facet: {
          // Calculate gross revenue (includes refunded bookings)
          gross: [
            {
              $match: {
                paymentStatus: { $in: ["paid", "refunded"] },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$finalPrice" },
              },
            },
          ],
          // Calculate net revenue (only paid bookings)
          net: [
            {
              $match: {
                paymentStatus: "paid",
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$finalPrice" },
              },
            },
          ],
        },
      },
    ]);

    // Extract values with fallback to 0
    const gross = result[0]?.gross[0]?.total || 0;
    const net = result[0]?.net[0]?.total || 0;

    // Calculate refund amount and rate
    const refunds = gross - net;
    const refundRate = gross > 0 ? (refunds / gross) * 100 : 0;

    return NextResponse.json({
      gross,
      net,
      refunds,
      refundRate,
    });
  } catch (error) {
    console.error("Revenue breakdown error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue breakdown" },
      { status: 500 },
    );
  }
}
