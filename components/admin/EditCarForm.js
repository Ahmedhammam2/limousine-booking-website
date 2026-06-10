"use client";

import { useState } from "react";
import { updateCar } from "@/actions/updateCar";
import EditCapacityAndLuggage from "@/components/admin/editCapacityAndLuggage";
import toast from "react-hot-toast";

export default function EditCarForm({ car, carId }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get("imageFile");

    // If a new file is uploaded, process it
    if (file && file.size > 0) {
      setIsUploading(true);
      const uploadToast = toast.loading("Uploading new image...");

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
        toast.success("Image uploaded", { id: uploadToast });
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to upload image", { id: uploadToast });
        setIsUploading(false);
        return; // Stop form submission if upload fails
      }
    } else {
      // Keep existing image URL
      formData.set("imageUrl", car.imageUrl);
    }

    formData.delete("imageFile");

    // Submit to server action
    setIsUploading(true);
    const updateToast = toast.loading("Updating car details...");
    try {
      await updateCar(formData);
      toast.success("Car updated successfully", { id: updateToast });
    } catch (error) {
      if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith?.("NEXT_REDIRECT")) {
        throw error;
      }
      console.error(error);
      toast.error(error.message || "Failed to update car", { id: updateToast });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {/* Identify car */}
      <input type="hidden" name="carId" value={carId} />

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
            defaultValue={car.name}
            className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block font-medium text-sm sm:text-base mb-1">
            Car Type
          </label>
          <select
            name="type"
            required
            defaultValue={car.type}
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
            required
            defaultValue={car.quantity}
            className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Number of identical cars available
          </p>
        </div>

        <div>
          <label className="block font-medium text-sm sm:text-base mb-1">
            Current Image
          </label>
          <div className="mb-2">
            <img src={car.imageUrl} alt={car.name} className="w-32 h-auto rounded border" />
          </div>
          <label className="block font-medium text-sm sm:text-base mb-1">
            Update Car Image (Optional)
          </label>
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </section>

      {/* 2. Capacity & Luggage */}
      <EditCapacityAndLuggage car={car} />

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
            defaultValue={car.minprice}
            className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
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
            defaultValue={car.pricePermile}
            className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
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
            defaultValue={car.minHours}
            className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
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
            defaultValue={car.pricePerHour}
            className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </section>

      <button 
        disabled={isUploading}
        className="w-full bg-black text-white py-2.5 sm:py-3 rounded text-sm sm:text-base hover:bg-gray-800 transition disabled:bg-gray-400"
      >
        {isUploading ? "Processing..." : "Edit car"}
      </button>
    </form>
  );
}
