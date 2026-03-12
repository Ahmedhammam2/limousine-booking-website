import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Convert incoming ISO string to Date object
    const startTime = new Date(body.startTime);

    // Estimated duration is doubled to account for round trips
    const totalMinutes = Number(body.estimatedDuration) * 2;

    // Calculate booking end time in milliseconds
    const endTime = new Date(startTime.getTime() + totalMinutes * 60000);

    // Create booking with initial unpaid / pending status
    const newBooking = await Booking.create({
      ...body,
      startTime,
      endTime,
      status: "pending",
      paymentStatus: "unpaid",
      originalPrice: body.finalPrice,
    });

    return Response.json({ bookingId: newBooking._id }, { status: 201 });
  } catch (error) {
    console.error("BOOKING API ERROR:", error);

    return Response.json({ error: error.message }, { status: 400 });
  }
}
