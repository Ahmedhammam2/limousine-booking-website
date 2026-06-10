"use server";

import connectDB from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function markNoShow(bookingId) {
  await connectDB();

  // Update only the status field, preserving all other booking data
  await Booking.findByIdAndUpdate(bookingId, {
    status: "no show",
  });

  revalidatePath("/admin/operations/bookings");
  redirect("/admin/operations/bookings?toast=no_show");
}
