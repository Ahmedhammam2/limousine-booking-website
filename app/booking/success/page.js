import connectDB from "@/lib/mongodb";
import Link from "next/link";
import { Booking } from "@/models/Booking";
import Stripe from "stripe";

export default async function SuccessPage({ searchParams }) {
  const params = await searchParams;
  const sessionId = params.session_id; // session_id comes from Stripe redirect URL

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3 sm:px-4">
        <p className="text-red-600 font-semibold text-base sm:text-lg">
          Invalid session
        </p>
      </div>
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Retrieve the checkout session from Stripe to verify payment
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error(err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3 sm:px-4">
        <p className="text-red-600 font-semibold text-base sm:text-lg">
          Could not retrieve Stripe session
        </p>
      </div>
    );
  }

  // Extract booking ID from Stripe session metadata
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3 sm:px-4">
        <p className="text-red-600 font-semibold text-base sm:text-lg">
          Booking reference missing
        </p>
      </div>
    );
  }

  // Connect to database and fetch the complete booking details
  await connectDB();
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3 sm:px-4">
        <p className="text-red-600 font-semibold text-base sm:text-lg">
          Booking not found
        </p>
      </div>
    );
  }

  // Generate appropriate payment status badge based on current status
  let paymentBadge;
  if (booking.paymentStatus === "paid") {
    paymentBadge = (
      <span className="bg-green-200 text-green-800 px-3 py-1 text-xs sm:text-sm rounded-full inline-flex items-center gap-1 mb-4">
        ✓ Payment Confirmed
      </span>
    );
  } else if (booking.paymentStatus === "pending") {
    paymentBadge = (
      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs sm:text-sm rounded-full inline-flex items-center gap-1 mb-4">
        ⏳ Payment Processing
      </span>
    );
  } else {
    paymentBadge = (
      <span className="bg-red-100 text-red-800 px-3 py-1 text-xs sm:text-sm rounded-full inline-flex items-center gap-1 mb-4">
        ✗ Payment Incomplete
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 md:py-12">
      {/* Main success card with responsive width and padding */}
      <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl max-w-2xl w-full p-6 sm:p-8">
        {/* Header section with success icon and messaging */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 text-green-600 text-2xl sm:text-3xl mb-3 sm:mb-4">
            ✓
          </div>
          <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Thank you! Your payment was successful.
          </p>
        </div>

        {/* Payment status badge centered below header */}
        <div className="flex justify-center">{paymentBadge}</div>

        {/* Show refresh message if payment is still processing */}
        {booking.paymentStatus === "pending" && (
          <p className="text-center text-yellow-700 text-xs sm:text-sm mb-4 sm:mb-6">
            Payment processing may take a few seconds. Please refresh this page
            shortly.
          </p>
        )}

        {/* Booking reference number with responsive padding */}
        <div className="mt-4 sm:mt-6 bg-gray-100 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500">Booking Reference</p>
          <p className="text-base sm:text-lg font-mono font-semibold text-gray-900 break-all">
            #{booking._id.toString()}
          </p>
        </div>

        {/* Booking details grid - 1 column on mobile, 2 on tablet and up */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Customer</p>
            <p className="font-medium text-gray-600 text-sm sm:text-base">
              {booking.customerName}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Email</p>
            <p className="font-medium text-gray-600 text-sm sm:text-base break-all">
              {booking.customerEmail}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Pickup Location</p>
            <p className="font-medium text-gray-600 text-sm sm:text-base">
              {booking.pickupLocation}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Dropoff Location</p>
            <p className="font-medium text-gray-600 text-sm sm:text-base">
              {booking.dropoffLocation}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Date</p>
            <p className="font-medium text-gray-600 text-sm sm:text-base">
              {new Date(booking.date).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Pickup Time</p>
            <p className="font-medium text-gray-600 text-sm sm:text-base">
              {new Date(booking.startTime).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Total Paid</p>
            <p className="font-semibold text-green-600 text-base sm:text-lg">
              ${booking.finalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Next steps section with responsive spacing */}
        <div className="mt-8 sm:mt-10 border-t pt-4 sm:pt-6">
          <h2 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 sm:mb-3">
            What's next?
          </h2>
          <ul className="space-y-1.5 sm:space-y-2 text-gray-600 text-xs sm:text-sm list-inside list-disc">
            <li>Driver will contact you before pickup</li>
            <li>Save your booking reference for future use</li>
          </ul>
        </div>

        {/* Back to home button with responsive sizing */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-black px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
