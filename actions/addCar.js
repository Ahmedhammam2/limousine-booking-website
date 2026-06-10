"use server";

import connectDB from "@/lib/mongodb";
import Car from "@/models/cars";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function addCar(formData) {
  await connectDB();

  const name = formData.get("name");
  const type = formData.get("type");
  const imageUrl = formData.get("imageUrl");

  // Convert string inputs to numbers for validation
  const capacity = Number(formData.get("capacity"));
  const luggage = Number(formData.get("luggage"));

  const minprice = Number(formData.get("minPrice"));
  const pricePerMile = Number(formData.get("pricePerMile"));

  const minHours = Number(formData.get("minHours"));
  const pricePerHour = Number(formData.get("pricePerHour"));
  const quantity = Number(formData.get("quantity"));

  // Validate all fields - luggage can be 0 but other numbers must be positive
  if (
    !name ||
    !type ||
    !imageUrl ||
    capacity <= 0 ||
    luggage < 0 ||
    minprice <= 0 ||
    pricePerMile <= 0 ||
    minHours <= 0 ||
    pricePerHour <= 0 ||
    quantity < 1
  ) {
    throw new Error("Invalid form data");
  }

  // Note: property name is pricePermile in the model (typo in schema)
  await Car.create({
    name,
    type,
    imageUrl,
    capacity,
    luggage,
    minprice,
    pricePermile: pricePerMile,
    minHours,
    pricePerHour,
    quantity,
  });

  revalidatePath("/admin/operations/cars");
  redirect("/admin/operations/cars?toast=added");
}
