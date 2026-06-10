import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
export async function GET(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    return Response.json(booking);
  } catch (error) {
    return Response.json(
      { error: "Database connection failed" },
      { status: 500 },
    );
  }
}
