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

export default async function FleetPage() {
  // Connect to MongoDB and fetch all cars
  await connectDB();

  // lean() returns plain JavaScript objects instead of Mongoose documents
  // JSON.parse(JSON.stringify()) ensures data is serializable for client components
  const cars = JSON.parse(JSON.stringify(await Car.find({}).lean()));

  // Only show cars marked as active in the database
  const filteredCars = cars.filter((car) => car.status === "active");

  return (
    // Wrapper ensures proper min height and bottom spacing
    <div className="min-h-screen pb-8 sm:pb-12 md:pb-16">
      {/* Pass filtered cars to client component for display */}
      <FleetWithFilters cars={filteredCars} />

      {/* Home Page Link - centered at bottom */}
      <div className="w-full flex justify-center mt-8 sm:mt-10 md:mt-12 px-4">
        <Link
          href="/"
          // Button padding and text size scale up on larger screens
          className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-200 transition"
        >
          Home page
        </Link>
      </div>
    </div>
  );
}
