import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

function redirectTo(url) {
  return Response.redirect(url, 302);
}

export async function GET(req, context) {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  // --- Validate token presence ---
  if (!token) {
    return redirectTo(`${baseUrl}/booking/refund-error?reason=missing_token`);
  }

  await connectDB();
  const booking = await Booking.findById(id);

  if (!booking) {
    return redirectTo(`${baseUrl}/booking/refund-error?reason=booking_not_found`);
  }

  // --- Validate token match ---
  if (booking.refundToken !== token) {
    return redirectTo(`${baseUrl}/booking/refund-error?reason=invalid_token`);
  }

  // --- Validate token expiry and pending status ---
  if (!booking.pendingRefund || !booking.refundTokenExpiresAt || new Date() > booking.refundTokenExpiresAt) {
    return redirectTo(`${baseUrl}/booking/refund-error?reason=expired_token`);
  }

  const refundAmt = booking.refundAmount;

  // --- Build waterfall of available payment intents ---
  const piAvailable = {};
  const recentPIs = [];

  if (booking.paymentHistory && booking.paymentHistory.length > 0) {
    // Sort newest first so we refund the most recent payment first
    const history = [...booking.paymentHistory].sort(
      (a, b) => new Date(b.paidAt) - new Date(a.paidAt)
    );
    for (const p of history) {
      if (!p.paymentIntentId) continue;
      if (!piAvailable[p.paymentIntentId]) {
        piAvailable[p.paymentIntentId] = 0;
        recentPIs.push(p.paymentIntentId);
      }
      piAvailable[p.paymentIntentId] += p.amount;
    }
  } else if (booking.stripePaymentId) {
    piAvailable[booking.stripePaymentId] = booking.finalPrice;
    recentPIs.push(booking.stripePaymentId);
  }

  // --- Waterfall refund ---
  let amountToRefund = refundAmt;
  const newlyRefunded = [];
  let refundWarning = null;

  try {
    for (const pi of recentPIs) {
      if (amountToRefund <= 0.001) break;
      const available = piAvailable[pi] || 0;
      if (available > 0.001) {
        const refundThisPI = Math.min(amountToRefund, available);
        const stripeRefund = await stripeClient.refunds.create({
          payment_intent: pi,
          amount: Math.round(refundThisPI * 100),
        });
        newlyRefunded.push({ stripeRefundId: stripeRefund.id, amount: refundThisPI });
        amountToRefund -= refundThisPI;
      }
    }

    if (amountToRefund > 0.01) {
      refundWarning = "partial";
    }
  } catch (err) {
    console.error("Stripe refund error:", err);
    return redirectTo(
      `${baseUrl}/booking/refund-error?reason=stripe_error&bookingId=${id}`
    );
  }

  // --- Update booking after successful refund ---
  const amountRefunded = refundAmt - amountToRefund;
  booking.finalPrice = booking.finalPrice - amountRefunded;
  booking.pendingRefund = false;
  booking.refundToken = null;
  booking.refundTokenExpiresAt = null;
  booking.refundAmount = 0;

  if (!booking.refundHistory) booking.refundHistory = [];
  for (const nr of newlyRefunded) {
    booking.refundHistory.push({
      amount: nr.amount,
      date: new Date(),
      stripeRefundId: nr.stripeRefundId,
    });
  }

  await booking.save();

  const warning = refundWarning ? `&warning=${refundWarning}` : "";
  return redirectTo(
    `${baseUrl}/booking/refund-success?bookingId=${id}&amount=${amountRefunded.toFixed(2)}${warning}`
  );
}
