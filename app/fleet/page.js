import FleetWithFilters from "@/components/fleetWithFilters";
import connectDB from "@/lib/mongodb";
import Car from "@/models/cars.js";
import Link from "next/link";

/*
  Fleet Page
  -----------
  Server component that displays the company's fleet of vehicles.
  Fetches all cars from database and filters out inactive ones.
  
  Note: This is a server component so database operations happen on the server.
  The actual filtering and display logic is handled by FleetWithFilters client component.
*/

import BackButton from "@/components/BackButton";

/* ... */

export default async function FleetPage() {
  await connectDB();
  const cars = JSON.parse(JSON.stringify(await Car.find({}).lean()));
  const filteredCars = cars.filter((car) => car.status === "active");

  return (
    <div className="min-h-screen pb-8 sm:pb-12 md:pb-16">
      <FleetWithFilters cars={filteredCars} />

      <div className="w-full flex justify-center mt-8 sm:mt-10 md:mt-12 px-4">
        <BackButton className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-200 transition">
          Back
        </BackButton>
      </div>
    </div>
  );
}
