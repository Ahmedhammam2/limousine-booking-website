import { NextResponse } from "next/server";
import { Booking } from "@/models/Booking";
import connectDB from "@/lib/mongodb";
import { getDateRanges } from "@/lib/adminAnalytics/dateHelpers";
import { getUtilizationStatus } from "@/lib/adminAnalytics/analytics";

/**
  GET /api/admin/analytics/fleet?period=month
  Returns fleet performance metrics for all cars
  Includes top performers by bookings and revenue
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
      Calculate number of days in the selected period
      Used for utilization calculations
     */
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const daysInPeriod = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    /**
      Aggregate performance metrics per car
      Includes lookup to get car details from cars collection
     */
    const carPerformance = await Booking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ["confirmed", "no show"] }, // Both count toward utilization
        },
      },
      {
        $addFields: {
          // Calculate trip duration in hours
          durationHours: {
            $divide: [{ $subtract: ["$endTime", "$startTime"] }, 3600000],
          },
          // Only count revenue from paid bookings
          revenueAmount: {
            $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$finalPrice", 0],
          },
        },
      },
      {
        $group: {
          _id: "$carId",
          bookingCount: { $sum: 1 },
          revenue: { $sum: "$revenueAmount" },
          totalBookedHours: { $sum: "$durationHours" },
        },
      },
      {
        /**
            Join with cars collection to get car details
            This gives us car name, type, and quantity
           */
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "_id",
          as: "carDetails",
        },
      },
      {
        $unwind: "$carDetails",
      },
      {
        $addFields: {
          /**
            Calculate total available hours
            Assumes 24 operating hours per day
            Multiplies by quantity to get total fleet capacity
             */
          totalAvailableHours: {
            $multiply: [daysInPeriod, 24, "$carDetails.quantity"],
          },
        },
      },
      {
        $addFields: {
          /**
              Utilization rate = (booked hours / available hours) * 100
              Shows how efficiently each car is being used
             */
          utilizationRate: {
            $multiply: [
              { $divide: ["$totalBookedHours", "$totalAvailableHours"] },
              100,
            ],
          },
          /**
              Idle hours = available hours - booked hours
              Shows wasted capacity
             */
          idleHours: {
            $subtract: ["$totalAvailableHours", "$totalBookedHours"],
          },
        },
      },
      {
        $project: {
          carId: { $toString: "$_id" },
          carName: "$carDetails.name",
          carType: "$carDetails.type",
          bookingCount: 1,
          revenue: 1,
          totalBookedHours: 1,
          totalAvailableHours: 1,
          utilizationRate: 1,
          idleHours: 1,
        },
      },
    ]);

    /**
      Add status indicator to each car based on utilization
      healthy = 50%+, monitor = 40-50%, warning = 30-40%, critical = <30%
     */
    const enrichedPerformance = carPerformance.map((car) => ({
      ...car,
      status: getUtilizationStatus(car.utilizationRate),
    }));

    /**
      Sort to get top 3 performers by different metrics
     */
    const topByBookings = [...enrichedPerformance]
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 3);

    const topByRevenue = [...enrichedPerformance]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    /**
      Identify underperforming cars
      Less than 30% utilization indicates a problem
     */
    const underperforming = enrichedPerformance.filter(
      (car) => car.utilizationRate < 30,
    );

    return NextResponse.json({
      topByBookings,
      topByRevenue,
      allCars: enrichedPerformance,
      underperforming,
    });
  } catch (error) {
    console.error("Fleet metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fleet metrics" },
      { status: 500 },
    );
  }
}
