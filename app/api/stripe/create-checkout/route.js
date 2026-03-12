import Stripe from "stripe";

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Parse checkout request data
  const body = await req.json();

  const {
    finalPrice,
    tripType,
    carId,
    carName,
    customerName,
    bookingId,
    searchParams,
  } = body;

  if (!finalPrice || finalPrice <= 0) {
    return new Response("Invalid price", { status: 400 });
  }

  if (!carId || !carName) {
    return new Response("Car data missing", { status: 400 });
  }

  // Stripe requires amounts in cents
  const FinalPriceInCents = Math.round(finalPrice * 100);

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${carName} – ${
                tripType === "transfer" ? "Transfer" : "Hourly"
              } Service`,
            },
            unit_amount: FinalPriceInCents,
          },
          quantity: 1,
        },
      ],
      success_url:
        "http://localhost:3000/booking/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: `http://localhost:3000/booking/cancelled?${searchParams}`,
      metadata: {
        tripType,
        carId,
        customerName,
        bookingId,
      },
      payment_intent_data: {
        metadata: { bookingId },
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);

    return new Response(`Error creating checkout session: ${error.message}`, {
      status: 500,
    });
  }
}
