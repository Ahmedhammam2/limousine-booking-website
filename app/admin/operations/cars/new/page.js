"use client";

import { useState } from "react";
import { addCar } from "@/actions/addCar";
import toast from "react-hot-toast";

export default function NewCar() {
  const [capacity, setCapacity] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get("imageFile");

    if (!file || file.size === 0) {
      toast.error("Please select an image");
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading("Uploading image...");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) throw new Error("Image upload failed");
      const { url } = await res.json();

      formData.set("imageUrl", url);
      formData.delete("imageFile");

      await addCar(formData);
      toast.success("Car added successfully", { id: uploadToast });
    } catch (error) {
      if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith?.("NEXT_REDIRECT")) {
        throw error;
      }
      console.error(error);
      toast.error(error.message || "Failed to upload image or add car", { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-6 md:py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-black">
          Add New Car
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* 1. Basic Info */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold border-b pb-2 text-black">
              1. Basic Info
            </h2>

            <div>
              <label className="block font-medium text-sm sm:text-base mb-1 text-black">
                Car Name
              </label>
              <input
                name="name"
                required
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
                placeholder="Mercedes Maybach GLS 600"
              />
            </div>

            <div>
              <label className="block font-medium text-sm sm:text-base mb-1 text-black">
                Car Type
              </label>
              {/* Added fallback colors here to ensure visible option fields */}
              <select
                name="type"
                required
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
              >
                <option value="" className="bg-white text-black">Select type</option>
                <option value="sedan" className="bg-white text-black">Sedan</option>
                <option value="hatchback" className="bg-white text-black">Hatchback</option>
                <option value="coupe" className="bg-white text-black">Coupe</option>
                <option value="convertible" className="bg-white text-black">Convertible</option>
                <option value="wagon" className="bg-white text-black">Wagon / Estate</option>
                <option value="suv" className="bg-white text-black">SUV</option>
                <option value="crossover" className="bg-white text-black">Crossover</option>
                <option value="minivan" className="bg-white text-black">Minivan</option>
                <option value="van" className="bg-white text-black">Van</option>
                <option value="mpv" className="bg-white text-black">MPV</option>
                <option value="pickup" className="bg-white text-black">Pickup</option>
                <option value="limousine" className="bg-white text-black">Limousine</option>
                <option value="sports" className="bg-white text-black">Sports</option>
                <option value="supercar" className="bg-white text-black">Supercar</option>
                <option value="offroad" className="bg-white text-black">Off-Road</option>
                <option value="electric" className="bg-white text-black">Electric</option>
                <option value="hybrid" className="bg-white text-black">Hybrid</option>
              </select>
            </div>

            {/* ✅ Quantity Field */}
            <div>
              <label className="block font-medium text-sm sm:text-base mb-1 text-black">
                Quantity (How many units)
              </label>
              <input
                name="quantity"
                type="number"
                min="1"
                defaultValue={1}
                required
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Number of identical cars available
              </p>
            </div>

            <div>
              <label className="block font-medium text-sm sm:text-base mb-1 text-black">
                Car Image
              </label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                required
                className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
              />
            </div>
          </section>

          {/* 2. Capacity & Luggage */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold border-b pb-2 text-black">
              2. Capacity & Luggage
            </h2>

            <input type="hidden" name="capacity" value={capacity} />
            <input type="hidden" name="luggage" value={luggage} />

            <div className="flex items-center gap-3 sm:gap-4 text-black">
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

            <div className="flex items-center gap-3 sm:gap-4 text-black">
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
            <h2 className="text-base sm:text-lg font-semibold border-b pb-2 text-black">
              3. Transfer Pricing
            </h2>

            <div>
              <label className="block text-sm sm:text-base mb-1 text-black">
                Minimum Price
              </label>
              <input
                name="minPrice"
                type="number"
                min="1"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base mb-1 text-black">
                Price per mile
              </label>
              <input
                name="pricePerMile"
                type="number"
                min="1"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
              />
            </div>
          </section>

          {/* 4. Hourly Pricing */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-semibold border-b pb-2 text-black">
              4. Hourly Pricing
            </h2>

            <div>
              <label className="block text-sm sm:text-base mb-1 text-black">
                Minimum hours
              </label>
              <input
                name="minHours"
                type="number"
                min="2"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base mb-1 text-black">
                Price per hour
              </label>
              <input
                name="pricePerHour"
                type="number"
                min="1"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
              />
            </div>
          </section>

          <button
            disabled={isUploading}
            className="w-full bg-black text-white py-2.5 sm:py-3 rounded hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {isUploading ? "Uploading & Creating..." : "Create Car"}
          </button>
        </form>
      </div>
    </div>
  );
}