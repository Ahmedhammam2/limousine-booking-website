"use client";

import { useState } from "react";

export default function EditCapacityAndLuggage({ car }) {
  const [capacity, setCapacity] = useState(car.capacity);
  const [luggage, setLuggage] = useState(car.luggage);

  return (
    <>
      {/* Capacity and Luggage section */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold border-b pb-2">
          2. Capacity & Luggage
        </h2>

        {/* Hidden inputs that store the actual values for form submission */}
        <input type="hidden" name="capacity" value={capacity} />
        <input type="hidden" name="luggage" value={luggage} />

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-sm sm:text-base min-w-[70px] sm:min-w-[80px]">
            Capacity:
          </span>
          <button
            type="button"
            onClick={() => setCapacity(Math.max(1, capacity - 1))}
            className="w-8 h-8 sm:w-10 sm:h-10 border rounded hover:bg-gray-100 transition text-lg sm:text-xl"
          >
            -
          </button>
          <span className="min-w-[30px] text-center text-sm sm:text-base">
            {capacity}
          </span>
          <button
            type="button"
            onClick={() => setCapacity(capacity + 1)}
            className="w-8 h-8 sm:w-10 sm:h-10 border rounded hover:bg-gray-100 transition text-lg sm:text-xl"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-sm sm:text-base min-w-[70px] sm:min-w-[80px]">
            Luggage:
          </span>
          <button
            type="button"
            onClick={() => setLuggage(Math.max(0, luggage - 1))}
            className="w-8 h-8 sm:w-10 sm:h-10 border rounded hover:bg-gray-100 transition text-lg sm:text-xl"
          >
            -
          </button>
          <span className="min-w-[30px] text-center text-sm sm:text-base">
            {luggage}
          </span>
          <button
            type="button"
            onClick={() => setLuggage(luggage + 1)}
            className="w-8 h-8 sm:w-10 sm:h-10 border rounded hover:bg-gray-100 transition text-lg sm:text-xl"
          >
            +
          </button>
        </div>
      </section>
    </>
  );
}
