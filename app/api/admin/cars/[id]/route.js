import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Car from "@/models/cars";
import mongoose from "mongoose";

export async function DELETE(req, { params }) {
  try {
    // Ensure database connection before any DB operation
    await connectDB();

    // Extract car ID from dynamic route
    const { id } = await params;
    const carId = id;

    // Prevent invalid ObjectId values from reaching the database
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return NextResponse.json({ error: "Invalid car ID" }, { status: 400 });
    }

    // Soft-delete logic: mark the car as retired instead of removing it
    // This preserves historical bookings linked to the car
    const result = await Car.updateOne(
      { _id: carId, status: "active" },
      { $set: { status: "retired" } },
    );

    // If nothing was updated, the car either does not exist or is already retired
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Car not found or already retired" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Catch-all error handler to avoid exposing server crashes
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
