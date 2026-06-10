import connectDB from "./mongodb";
import Car from "../models/cars";
import { Booking } from "../models/Booking";

export const getAvailableCars = async (bookingData) => {
  await connectDB();

  const startTime = new Date(bookingData.startISO);

  if (isNaN(startTime.getTime())) {
    return { cars: [] };
  }

  let totalMinutes;

  if (bookingData.tripType === "transfer") {
    totalMinutes = Number(bookingData.estimatedDuration) * 2;
  } else if (bookingData.tripType === "hourly") {
    totalMinutes = Number(bookingData.estimatedDuration) * 2;
  }

  if (!totalMinutes || isNaN(totalMinutes)) {
    console.error("Invalid estimatedDuration:", bookingData.estimatedDuration);
    return { cars: [] };
  }

  const endTime = new Date(startTime.getTime() + totalMinutes * 60000);

  const bookingQuery = {
    status: { $in: ["pending", "confirmed"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  // Exclude current booking when editing
  if (bookingData.edit === true && bookingData.bookingId) {
    bookingQuery._id = { $ne: bookingData.bookingId };
  }

  const bookings = await Booking.find(bookingQuery);

  const carCountById = {};

  for (const booking of bookings) {
    if (!booking.carId) continue; // Skip bookings with no assigned car
    const carId = booking.carId.toString();

    if (!carCountById[carId]) {
      carCountById[carId] = 1;
    } else {
      carCountById[carId]++;
    }
  }

  const requiredSeats =
    Number(bookingData.passengers || 0) + Number(bookingData.kids || 0);
  const requiredLuggage = Number(bookingData.luggage || 0);

  // Fallback to 0 if NaN to avoid MongoDB errors
  const safeSeats = isNaN(requiredSeats) ? 0 : requiredSeats;
  const safeLuggage = isNaN(requiredLuggage) ? 0 : requiredLuggage;

  const cars = await Car.find({
    status: "active",
    capacity: { $gte: safeSeats },
    luggage: { $gte: safeLuggage },
  }).lean();
  const availableCars = [];

  for (const car of cars) {
    const carId = car._id.toString();
    const bookedCount = carCountById[carId] || 0;
    const availableUnits = Math.max(0, car.quantity - bookedCount);
    if (availableUnits > 0) {
      availableCars.push({
        ...car,
        availableUnits,
      });
    }
  }

  return { cars: availableCars };
};
