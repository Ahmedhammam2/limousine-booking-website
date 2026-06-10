"use server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

export async function deleteBooking(bookingId) {
  await connectDB();
  await Booking.findByIdAndDelete(bookingId);

  // Revalidate the bookings page cache to reflect the deletion
  revalidatePath("/admin/operations/bookings");

  // Redirect with toast parameter to show success message
  redirect("/admin/operations/bookings?toast=deleted");
}
