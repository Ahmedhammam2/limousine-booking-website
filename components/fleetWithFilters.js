"use client";

import { useState } from "react";
import CarCard from "./CarCard";

/*
  FleetWithFilters Component
  ---------------------------
  Displays all available cars with filtering capability.
  Allows users to filter by car type or view all cars.
  
  Features:
  - Dynamic filter buttons based on available car types
  - Responsive grid layout
  - Shows "No cars found" message when filter returns empty
*/

export default function FleetWithFilters({ cars }) {
  const [filter, setFilter] = useState("all");

  // Extract unique car types from the cars array
  // Using Set to remove duplicates, filter removes any undefined/null values
  const carTypes = Array.from(
    new Set(cars.map((car) => car.type?.toLowerCase()).filter(Boolean)),
  );

  // Create filter array with "all" option first
  const filters = ["all", ...carTypes];

  // Filter cars based on selected type
  // If "all" is selected, show everything
  const displayedCars =
    filter === "all"
      ? cars
      : cars.filter((car) => car.type?.toLowerCase() === filter);

  // Format filter labels for display - capitalize each word
  const formatLabel = (type) =>
    type === "all"
      ? "All Cars"
      : type
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

  return (
    <div className="w-full">
      {/* Filter Buttons Section */}
      {/* Flexbox wraps buttons on smaller screens, centers them horizontally */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 pt-6 sm:pt-8 md:pt-10 px-3 sm:px-4">
        {filters.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            // Active filter gets black background, others are white
            className={`px-4 sm:px-5 md:px-6 py-2 text-sm sm:text-base rounded-full font-semibold shadow-md transition ${
              filter === type
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {formatLabel(type)}
          </button>
        ))}
      </div>

      {/* Cars Grid */}
      {/* Grid adjusts columns based on screen width:
          Mobile: 1 column
          Small (640px+): 2 columns
          Large (1024px+): 3 columns
          Extra Large (1280px+): 4 columns */}
      <div className="max-w-7xl mx-auto mt-6 sm:mt-8 md:mt-10 px-3 sm:px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {displayedCars.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 text-sm sm:text-base">
            No cars found.
          </p>
        ) : (
          displayedCars.map((car) => (
            <CarCard key={car._id} car={car} variant="fleet" />
          ))
        )}
      </div>
    </div>
  );
}
