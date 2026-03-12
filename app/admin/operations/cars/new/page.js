"use client";

import { useState } from "react";
import { addCar } from "@/actions/addCar";

export default function NewCar() {
  const [capacity, setCapacity] = useState(1);
  const [luggage, setLuggage] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-6 md:py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">
          Add New Car
        </h1>

        <form action={addCar} className="space-y-6 sm:space-y-8">
          {/* 1. Basic Info */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold border-b pb-2">
              1. Basic Info
            </h2>

            <div>
              <label className="block font-medium text-sm sm:text-base mb-1">
                Car Name
              </label>
              <input
                name="name"
                required
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Mercedes Maybach GLS 600"
              />
            </div>

            <div>
              <label className="block font-medium text-sm sm:text-base mb-1">
                Car Type
              </label>
              <select
                name="type"
                required
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select type</option>
                <option value="sedan">Sedan</option>
                <option value="hatchback">Hatchback</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="wagon">Wagon / Estate</option>
                <option value="suv">SUV</option>
                <option value="crossover">Crossover</option>
                <option value="minivan">Minivan</option>
                <option value="van">Van</option>
                <option value="mpv">MPV</option>
                <option value="pickup">Pickup</option>
                <option value="limousine">Limousine</option>
                <option value="sports">Sports</option>
                <option value="supercar">Supercar</option>
                <option value="offroad">Off-Road</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* ✅ Quantity Field */}
            <div>
              <label className="block font-medium text-sm sm:text-base mb-1">
                Quantity (How many units)
              </label>
              <input
                name="quantity"
                type="number"
                min="1"
                defaultValue={1}
                required
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Number of identical cars available
              </p>
            </div>

            <div>
              <label className="block font-medium text-sm sm:text-base mb-1">
                Image URL
              </label>
              <input
                name="image"
                required
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://example.com/car.png"
              />
            </div>
          </section>

          {/* 2. Capacity & Luggage */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold border-b pb-2">
              2. Capacity & Luggage
            </h2>

            <input type="hidden" name="capacity" value={capacity} />
            <input type="hidden" name="luggage" value={luggage} />

            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-sm sm:text-base min-w-[80px]">Seats:</span>
              <button
                type="button"
                onClick={() => setCapacity(Math.max(1, capacity - 1))}
                className="w-8 h-8 sm:w-10 sm:h-10 border rounded hover:bg-gray-100 transition text-lg"
              >
                -
              </button>
              <span className="min-w-[30px] text-center">{capacity}</span>
              <button
                type="button"
                onClick={() => setCapacity(capacity + 1)}
                className="w-8 h-8 sm:w-10 sm:h-10 border rounded hover:bg-gray-100 transition text-lg"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-sm sm:text-base min-w-[80px]">
                Luggage:
              </span>
              <button
                type="button"
                onClick={() => setLuggage(Math.max(0, luggage - 1))}
                className="w-8 h-8 sm:w-10 sm:h-10 border rounded hover:bg-gray-100 transition text-lg"
              >
                -
              </button>
              <span className="min-w-[30px] text-center">{luggage}</span>
              <button
                type="button"
                onClick={() => setLuggage(luggage + 1)}
                className="w-8 h-8 sm:w-10 sm:h-10 border rounded hover:bg-gray-100 transition text-lg"
              >
                +
              </button>
            </div>
          </section>

          {/* 3. Transfer Pricing */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold border-b pb-2">
              3. Transfer Pricing
            </h2>

            <div>
              <label className="block text-sm sm:text-base mb-1">
                Minimum Price
              </label>
              <input
                name="minPrice"
                type="number"
                min="1"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base mb-1">
                Price per mile
              </label>
              <input
                name="pricePerMile"
                type="number"
                min="1"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </section>

          {/* 4. Hourly Pricing */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold border-b pb-2">
              4. Hourly Pricing
            </h2>

            <div>
              <label className="block text-sm sm:text-base mb-1">
                Minimum hours
              </label>
              <input
                name="minHours"
                type="number"
                min="2"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base mb-1">
                Price per hour
              </label>
              <input
                name="pricePerHour"
                type="number"
                min="1"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </section>

          <button className="w-full bg-black text-white py-2.5 sm:py-3 rounded hover:bg-gray-800 transition">
            Create Car
          </button>
        </form>
      </div>
    </div>
  );
}
