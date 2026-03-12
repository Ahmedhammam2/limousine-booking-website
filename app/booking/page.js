import BookingForm from "@/components/booking/BookingForm";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";

/**
 * BookingPage
 * ------------
 * Page-level container for the booking flow
 */
export default async function BookingPage({ searchParams }) {
  const params = await searchParams;
  const { edit, bookingId } = params;

  let initialBooking = null;

  // Editing an existing booking
  if (edit === "true" && bookingId) {
    await connectDB();
    const booking = await Booking.findById(bookingId).lean();

    if (booking) {
      initialBooking = {
        ...booking,
        _id: booking._id.toString(),
        carId: booking.carId?.toString() || null,
        date: booking.date?.toISOString() || null,
        startTime: booking.startTime?.toISOString() || null,
        endTime: booking.endTime?.toISOString() || null,
      };
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black mb-4 sm:mb-6 md:mb-8">
          Book A Ride
        </h1>

        <BookingForm
          isEditing={edit === "true"}
          initialData={initialBooking}
          bookingId={bookingId}
        />
      </div>
    </div>
  );
}
