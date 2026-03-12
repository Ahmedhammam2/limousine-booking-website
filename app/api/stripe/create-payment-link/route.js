import Stripe from "stripe";
export async function createStripePaymentLink(bookingId, amount) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Additional payment for Booking #${bookingId}`,
          },
          unit_amount: Math.round(Number(amount) * 100), // cents
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId, type: "edit_additional_payment" },
    after_completion: {
      type: "redirect",
      redirect: {
        url: `http://localhost:3000/booking/edit-success?bookingId=${bookingId}`,
      },
    },
  });

  return paymentLink.url;
}
