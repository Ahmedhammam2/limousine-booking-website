import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { BookingFilters } from "@/components/admin/activeFilters";
import BookingsTable from "@/components/admin/bookingsTable";
import BookingToast from "@/components/admin/bookingToast";

export const dynamic = "force-dynamic";

export default async function BookingsPage({ searchParams }) {
  await connectDB();
  const params = await searchParams;
  const toastType = params?.toast;

  const filter = params?.filter || "all";
  const search = params?.search || "";

  let query = {};
  const now = new Date();

  // Filter bookings for current week
  if (filter === "this_week") {
    // Get the start of the week (Sunday)
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);

    // Calculate end of week
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    query.startTime = { $gte: start, $lt: end };
  }

  // Filter bookings for current month
  if (filter === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    query.startTime = { $gte: start, $lt: end };
  }

  // Search across multiple fields if search term is provided
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { customerPhone: { $regex: search, $options: "i" } },
      { carId: { $regex: search, $options: "i" } },
    ];
  }

  // Fetch bookings from database, newest first
  const bookings = await Booking.find(query)
    .sort({
      createdAt: -1,
    })
    .lean();

  // Convert MongoDB objects to plain strings for client components
  const serializedBookings = bookings.map((b) => ({
    ...b,
    _id: b._id.toString(),
    carId: b.carId?.toString(),
    date: b.date.toISOString(),
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    // These contain nested ObjectIds which are not valid to pass to Client Components.
    paymentHistory: undefined,
    refundHistory: undefined,
  }));

  return (
    <>
      <BookingToast toastType={toastType} />

      {/* Responsive padding - smaller on mobile, larger on desktop */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <BookingFilters activeFilter={filter} />
        <BookingsTable bookings={serializedBookings} />
      </div>
    </>
  );
}
