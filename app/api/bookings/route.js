import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Resend } from "resend"; // 1. Import Resend

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // --- FIX 1: CLEAN AND FIX MOBILE PHONE STRINGS ---
    if (body.customerPhone) {
      body.customerPhone = body.customerPhone.replace(/\D/g, "");
    }

    // --- FIX 2: CONVERT DATE STRINGS TO DATE OBJECTS CORRECTLY ---
    let finalDate = body.date;
    if (typeof finalDate === "string") {
      if (finalDate.includes("/")) {
        const [month, day, year] = finalDate.split("/");
        finalDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      } else {
        finalDate = new Date(finalDate);
      }
    }

    if (finalDate instanceof Date && !isNaN(finalDate)) {
      finalDate = new Date(Date.UTC(finalDate.getUTCFullYear(), finalDate.getUTCMonth(), finalDate.getUTCDate()));
    }

    let parsedTime = Date.parse(body.startTime);
    if (isNaN(parsedTime)) {
      parsedTime = new Date().getTime();
    }
    const startTime = new Date(parsedTime);
    const totalMinutes = Number(body.estimatedDuration) * 2;
    const endTime = new Date(startTime.getTime() + totalMinutes * 60000);

    // Create booking in database
    const newBooking = await Booking.create({
      ...body,
      date: finalDate,
      startTime,
      endTime,
      status: "pending",
      paymentStatus: "unpaid",
      originalPrice: body.finalPrice,
    });

    // --- FIX 3: SEND TRANSACTIONAL EMAILS ---
    // NOTE: On the Resend free tier, before you verify a custom domain, 
    // you can only send emails TO your own signup email address.
    if (process.env.RESEND_API_KEY) {
      try {
        const formattedDate = finalDate.toLocaleDateString("en-US", {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // Email 1: Alert the Admin
        await resend.emails.send({
          from: "Limo Booking <onboarding@resend.dev>",
          to: "hammam.m.ahmed@gmail.com", // Your admin email
          subject: "New Ride Request Logged!",
          html: `
            <h3>A new booking request requires review</h3>
            <p><strong>Customer:</strong> ${body.customerName}</p>
            <p><strong>Phone:</strong> ${body.customerPhone}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Route:</strong> ${body.pickupLocation} ➔ ${body.dropoffLocation}</p>
            <p><strong>Price:</strong> $${body.finalPrice}</p>
            <a href="${process.env.NEXT_PUBLIC_URL}/admin" style="background:#0070f3;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Open Admin Panel</a>
          `,
        });

        // Email 2: Confirmation Receipt to the Customer
        // (When you add a domain like 'yourlimoservice.com', change 'to' to body.customerEmail)
        await resend.emails.send({
          from: "Limo Booking <onboarding@resend.dev>",
          to: "hammam.m.ahmed@gmail.com", // Temporarily your email for testing free mode
          subject: "Your Limo Ride Request Received",
          html: `
            <h2>Hello ${body.customerName},</h2>
            <p>Thank you for choosing our luxury transfer service. We have received your ride request details:</p>
            <hr />
            <p><strong>Scheduled Date:</strong> ${formattedDate}</p>
            <p><strong>Pickup Location:</strong> ${body.pickupLocation}</p>
            <p><strong>Drop-off Location:</strong> ${body.dropoffLocation}</p>
            <p><strong>Estimated Cost:</strong> $${body.finalPrice}</p>
            <p><strong>Receipt:</strong> ${newBooking._id}</p>
            <p>If you did not sign up for this you can ignore this email</p>
            <hr />
            
          `,
        });
      } catch (emailError) {
        console.error("Failed to distribute transactional alerts:", emailError);
        // We don't crash the API response if an email fails; database creation takes priority
      }
    }

    return Response.json({ bookingId: newBooking._id }, { status: 201 });
  } catch (error) {
    console.error("BOOKING API ERROR:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return Response.json({ error: `Validation Failed: ${messages.join(", ")}` }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 400 });
  }
}


export async function GET() {
  try {
    await connectDB();
    // Fetch bookings sorted by the newest first
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    return Response.json({ bookings }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
