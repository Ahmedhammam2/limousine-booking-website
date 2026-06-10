import connectDB from "@/lib/mongodb";
import { createStripePaymentLink } from "@/app/api/stripe/create-payment-link/route";
import { Booking } from "@/models/Booking";
import Car from "@/models/cars";

export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    await connectDB();

    const booking = await Booking.findById(id);
    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
      });
    }

    const body = await req.json();
    const {
      tripType,
      carId,
      distance,
      duration,
      stops,
      pickup,
      dropoff,
      passengers,
      luggage,
    } = body;

    const car = await Car.findById(carId);
    if (!car) {
      return new Response(JSON.stringify({ error: "Invalid car" }), {
        status: 400,
      });
    }

    let newPrice = 0;

    // ===== PRICE CALCULATION =====
    if (tripType === "transfer") {
      const basePrice = car.pricePermile * distance;
      newPrice = Math.round(Math.max(basePrice, car.minprice) * 100) / 100;
    }

    if (tripType === "hourly") {
      let totalHours = 0;

      if (typeof duration === "object") {
        totalHours = (duration.hours || 0) + (duration.minutes || 0) / 60;
      }

      if (typeof duration === "number") {
        totalHours = duration;
      }

      const billedHours = Math.max(totalHours, car.minHours);
      newPrice = billedHours * car.pricePerHour;
    }

    const amountAlreadyPaid = booking.finalPrice;
    const difference = Math.round((newPrice - amountAlreadyPaid) * 100) / 100;

    // ===== PAYMENT LOGIC =====
    if (difference > 0) {
      const paymentLink = await createStripePaymentLink(id, difference);

      // ===== UPDATE BOOKING STATE =====
      booking.tripType = tripType;
      booking.carId = carId;
      booking.distance = distance;
      booking.estimatedDuration = tripType === "hourly" ? Math.round(duration * 60) : booking.estimatedDuration;
      booking.pickupLocation = pickup;
      booking.dropoffLocation = dropoff;
      booking.stops = stops;
      booking.passengers = passengers;
      booking.luggage = luggage;

      booking.pendingPayment = true;
      booking.amountDue = difference;
      booking.paymentLinkUrl = paymentLink;
      booking.paymentLinkCreatedAt = new Date();
      booking.paymentLinkExpiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      );
      booking.paymentStatus = "pending";

      await booking.save();

      return new Response(
        JSON.stringify({
          status: "payment_required",
          paymentLink,
          amount: difference,
        }),
        { status: 200 },
      );
    }

    if (difference < 0) {
      const refundAmt = Math.abs(difference);
      const token = crypto.randomUUID();

      // Save the new trip details but do NOT change finalPrice yet.
      // finalPrice will only be updated after the refund is confirmed via the link.
      booking.tripType = tripType;
      booking.carId = carId;
      booking.distance = distance;
      booking.estimatedDuration = tripType === "hourly" ? Math.round(duration * 60) : booking.estimatedDuration;
      booking.pickupLocation = pickup;
      booking.dropoffLocation = dropoff;
      booking.stops = stops;
      booking.passengers = passengers;
      booking.luggage = luggage;

      booking.pendingRefund = true;
      booking.refundAmount = refundAmt;
      booking.refundToken = token;
      booking.refundTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await booking.save();

      const baseUrl = process.env.NEXT_PUBLIC_URL;
      const refundLink = `${baseUrl}/api/bookings/${id}/process-refund?token=${token}`;

      return new Response(
        JSON.stringify({
          status: "refund_link_generated",
          refundLink,
          amount: refundAmt,
        }),
        { status: 200 },
      );
    }

    // No payment needed logic
    booking.tripType = tripType;
    booking.carId = carId;
    booking.finalPrice = newPrice; // because difference is exactly 0
    booking.distance = distance;
    booking.estimatedDuration = tripType === "hourly" ? Math.round(duration * 60) : booking.estimatedDuration;
    booking.pickupLocation = pickup;
    booking.dropoffLocation = dropoff;
    booking.stops = stops;
    booking.passengers = passengers;
    booking.luggage = luggage;

    await booking.save();

    return new Response(JSON.stringify({ status: "no_payment_needed" }), {
      status: 200,
    });
  } catch (error) {
    console.error("PATCH booking edit error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update booking",
        details: error.message,
      }),
      { status: 500 },
    );
  }
}

