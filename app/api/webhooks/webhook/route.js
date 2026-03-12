export const runtime = "nodejs";

import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Signature error:", err.message);
    return new Response("Webhook signature error", { status: 400 });
  }

  await connectDB();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    let bookingId = session.metadata?.bookingId;
    let paymentType = session.metadata?.type;

    // Payment Links don't always propagate metadata to the Checkout Session.
    // Fall back to PaymentIntent metadata, then PaymentLink metadata.
    if ((!bookingId || !paymentType) && session.payment_intent) {
      try {
        const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
        bookingId = bookingId || pi.metadata?.bookingId;
        paymentType = paymentType || pi.metadata?.type;
      } catch (err) {
        console.error("PaymentIntent retrieve error:", err?.message || err);
      }
    }

    if ((!bookingId || !paymentType) && session.payment_link) {
      try {
        const link = await stripe.paymentLinks.retrieve(session.payment_link);
        bookingId = bookingId || link.metadata?.bookingId;
        paymentType = paymentType || link.metadata?.type;
      } catch (err) {
        console.error("PaymentLink retrieve error:", err?.message || err);
      }
    }

    if (!bookingId) {
      return new Response("Booking ID missing", { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return new Response("Booking not found", { status: 404 });
    }

    // Idempotency: avoid duplicating history entries on webhook retries
    const paymentIntentId = session.payment_intent || null;
    const alreadyRecorded =
      paymentIntentId &&
      Array.isArray(booking.paymentHistory) &&
      booking.paymentHistory.some((p) => p.paymentIntentId === paymentIntentId);

    // edit additional payment
    if (paymentType === "edit_additional_payment") {
      booking.pendingPayment = false;
      booking.amountDue = 0;
      booking.paymentLinkUrl = null;
      booking.paymentLinkCreatedAt = null;
      booking.paymentLinkExpiresAt = null;

      // Add to payment history
      if (!alreadyRecorded) {
        booking.paymentHistory.push({
          amount: session.amount_total / 100,
          type: "edit_additional_payment",
          paymentIntentId,
          paidAt: new Date(),
        });
        // Ensure the booking total increases by the new payment amount upon confirmation.
        booking.finalPrice = booking.finalPrice + (session.amount_total / 100);
      }

      booking.paymentStatus = "paid";

      await booking.save();
      return new Response("Edit payment processed", { status: 200 });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.stripePaymentId = paymentIntentId;

    // Add initial payment to history
    if (!alreadyRecorded) {
      booking.paymentHistory.push({
        amount: session.amount_total / 100,
        type: "initial_payment",
        paymentIntentId,
        paidAt: new Date(),
      });
    }

    await booking.save();
  }

  return new Response("OK", { status: 200 });
}



