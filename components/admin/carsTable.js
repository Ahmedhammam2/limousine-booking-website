"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CarsTable({ cars }) {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");

  async function retireCarHandler(carId, carName) {
    const confirmDelete = window.confirm(`Retire ${carName}?`);
    if (!confirmDelete) return;

    const res = await fetch(`/api/admin/cars/${carId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      toast.success("car retired successfully");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete car");
    }
  }

  const filteredCars = cars.filter((car) =>
    car._id.toLowerCase().includes(searchId.toLowerCase()),
  );

  return (
    <>
      {/* Search */}
      <input
        type="text"
        placeholder="Search by Car ID..."
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        className="mb-4 w-full border p-2 rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black"
      />

      {/* ===== Desktop Table ===== */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border text-xs xl:text-sm">ID</th>
              <th className="p-2 border text-xs xl:text-sm">Image</th>
              <th className="p-2 border text-xs xl:text-sm">Name</th>
              <th className="p-2 border text-xs xl:text-sm">Status</th>
              <th className="p-2 border text-xs xl:text-sm">Type</th>
              <th className="p-2 border text-xs xl:text-sm">Qty</th>
              <th className="p-2 border text-xs xl:text-sm">
                Capacity / Luggage
              </th>
              <th className="p-2 border text-xs xl:text-sm">Price</th>
              <th className="p-2 border text-xs xl:text-sm">Minimum</th>
              <th className="p-2 border text-xs xl:text-sm">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCars.map((car) => (
              <tr key={car._id} className="border-b">
                <td className="p-2 border text-xs font-mono">
                  {car._id.slice(-6)}
                </td>

                <td className="p-2 border">
                  <img
                    src={car.imageUrl}
                    alt={car.name}
                    className="w-20 h-12 object-cover"
                  />
                </td>

                <td className="p-2 border text-xs xl:text-sm">{car.name}</td>

                <td
                  className={`p-2 border font-semibold text-xs xl:text-sm ${
                    car.status === "active" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {car.status}
                </td>

                <td className="p-2 border text-xs xl:text-sm">{car.type}</td>

                {/* ✅ Quantity */}
                <td className="p-2 border text-xs xl:text-sm font-semibold text-center">
                  {car.quantity}
                </td>

                <td className="p-2 border text-xs xl:text-sm">
                  {car.capacity} / {car.luggage}
                </td>

                <td className="p-2 border text-xs xl:text-sm">
                  ${car.pricePerHour}/hr — ${car.pricePermile}/mile
                </td>

                <td className="p-2 border text-xs xl:text-sm">
                  {car.minHours} hrs — ${car.minprice}
                </td>

                <td className="p-2 border text-xs xl:text-sm">
                  {car.status === "active" && (
                    <Link
                      href={`/admin/operations/cars/${car._id}/edit`}
                      className="text-blue-500 mr-2"
                    >
                      Edit
                    </Link>
                  )}

                  <button
                    className="text-red-500 disabled:text-gray-400"
                    disabled={car.status === "retired"}
                    onClick={() => retireCarHandler(car._id, car.name)}
                  >
                    Retire
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile Cards ===== */}
      <div className="lg:hidden space-y-4">
        {filteredCars.map((car) => (
          <div key={car._id} className="border rounded-lg p-4 bg-white shadow">
            <div className="flex gap-3 mb-3">
              <img
                src={car.imageUrl}
                alt={car.name}
                className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {car.name}
                </h3>
                <p className="text-xs text-gray-600">ID: {car._id.slice(-6)}</p>
                <p
                  className={`text-xs font-semibold mt-1 ${
                    car.status === "active" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {car.status.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-3">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-1 font-medium">{car.type}</span>
              </div>

              <div>
                <span className="text-gray-600">Quantity:</span>
                <span className="ml-1 font-medium">{car.quantity}</span>
              </div>

              <div>
                <span className="text-gray-600">Capacity:</span>
                <span className="ml-1 font-medium">
                  {car.capacity} / {car.luggage}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Hourly:</span>
                <span className="ml-1 font-medium">${car.pricePerHour}/hr</span>
              </div>

              <div>
                <span className="text-gray-600">Per Mile:</span>
                <span className="ml-1 font-medium">${car.pricePermile}</span>
              </div>

              <div>
                <span className="text-gray-600">Min Price:</span>
                <span className="ml-1 font-medium">${car.minprice}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              {car.status === "active" && (
                <Link
                  href={`/admin/operations/cars/${car._id}/edit`}
                  className="flex-1 text-center bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition"
                >
                  Edit
                </Link>
              )}
              <button
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={car.status === "retired"}
                onClick={() => retireCarHandler(car._id, car.name)}
              >
                Retire
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
