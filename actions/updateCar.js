"use server";
import connectDB from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Car from "@/models/cars";

export async function updateCar(formData) {
  await connectDB();

  const name = formData.get("name");
  const type = formData.get("type");
  const image = formData.get("image");

  const capacity = Number(formData.get("capacity"));
  const luggage = Number(formData.get("luggage"));

  const minprice = Number(formData.get("minPrice"));
  const pricePermile = Number(formData.get("pricePerMile"));

  const minHours = Number(formData.get("minHours"));
  const quantity = Number(formData.get("quantity"));
  const pricePerHour = Number(formData.get("pricePerHour"));

  // Extract the car ID to identify which record to update
  const carId = formData.get("carId");

  // Validate carId is provided along with other required fields
  if (
    !carId ||
    !name ||
    !type ||
    !image ||
    capacity <= 0 ||
    luggage < 0 ||
    minprice <= 0 ||
    pricePermile <= 0 ||
    minHours <= 0 ||
    pricePerHour <= 0 ||
    quantity < 1
  ) {
    throw new Error("Invalid form data");
  }

  // Return updated document with new: true option
  const updatedCar = await Car.findByIdAndUpdate(
    carId,
    {
      name,
      type,
      image,
      capacity,
      luggage,
      minprice,
      pricePermile,
      minHours,
      pricePerHour,
      quantity,
    },
    { new: true },
  );

  if (!updatedCar) {
    throw new Error("Car not found");
  }

  revalidatePath("/admin/operations/cars");
  return redirect("/admin/operations/cars?toast=edited");
}
