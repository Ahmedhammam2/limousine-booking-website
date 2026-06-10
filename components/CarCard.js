"use client";

import NextImage from "next/image";

/*
  CarCard Component
  ------------------
  Displays individual car information with image and details.
  Used in both the fleet page and available vehicles page.
  
  Props:
  - car: object containing car data (name, image, capacity, etc.)
  - variant: "default" or "fleet" - controls image height
*/

export default function CarCard({ car, variant = "default" }) {
  // Different image heights based on where the card is displayed
  // Fleet page gets taller images for better showcase
  const imageHeight =
    variant === "fleet"
      ? "h-48 sm:h-56 md:h-64 lg:h-72"
      : "h-40 sm:h-48 md:h-56 lg:h-60";

  return (
    <div className="rounded-lg shadow-md hover:shadow-lg transition p-3 sm:p-4 w-full bg-white">
      {/* Car Image Container */}
      <div className={`relative w-full ${imageHeight} mb-3 sm:mb-4`}>
        <NextImage
          src={car.imageUrl}
          alt={car.name}
          fill
          className="object-cover rounded-md"
          // Responsive sizes to optimize image loading across devices
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* Car Details */}
      <div className="text-black">
        <h2 className="text-lg sm:text-xl font-bold mb-2">{car.name}</h2>
        {/* Font size adjusts from small on mobile to base on larger screens */}
        <p className="text-sm sm:text-base">
          Capacity: {car.capacity} passengers
        </p>
        <p className="text-sm sm:text-base">Luggage: {car.luggage} bags</p>
        <p className="text-sm sm:text-base">Price per Hour: ${car.pricePerHour}</p>
        <p className="text-sm sm:text-base">Price per Mile: ${car.pricePermile}</p>
        <p className="text-sm sm:text-base text-gray-400 mt-1 text-xs">Minimum Price: ${car.minprice}</p>
      </div>
    </div>
  );
}
