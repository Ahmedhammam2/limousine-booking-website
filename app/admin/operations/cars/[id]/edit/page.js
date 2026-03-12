import { updateCar } from "@/actions/updateCar";
import { notFound } from "next/navigation";
import EditCapacityAndLuggage from "@/components/admin/editCapacityAndLuggage";
import connectDB from "@/lib/mongodb";
import Car from "@/models/cars";

export default async function Edit({ params }) {
  const resolvedParams = await params;
  const carId = resolvedParams.id;

  await connectDB();
  const carDoc = await Car.findById(carId).lean();

  if (!carDoc) {
    notFound();
  }

  const car = {
    ...carDoc,
    _id: carDoc._id.toString(),
    createdAt: carDoc.createdAt?.toISOString(),
    updatedAt: carDoc.updatedAt?.toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-6 md:py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Edit Car</h1>

        <form action={updateCar} className="space-y-6 sm:space-y-8">
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
                Image URL
              </label>
              <input
                name="image"
                required
                defaultValue={car.image}
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

          <button className="w-full bg-black text-white py-2.5 sm:py-3 rounded text-sm sm:text-base hover:bg-gray-800 transition">
            Edit car
          </button>
        </form>
      </div>
    </div>
  );
}
