import CarsTable from "@/components/admin/carsTable";
import Car from "@/models/cars";
import connectDB from "@/lib/mongodb";
import Link from "next/link";
import CarToast from "@/components/admin/carToast";

// Force dynamic rendering to always get fresh data
export const dynamic = "force-dynamic";

export default async function CarsPage({ searchParams }) {
  await connectDB();
  const params = await searchParams;
  const toastType = params?.toast;

  const cars = await Car.find().lean();

  // Serialize MongoDB objects for client components
  const serializedCars = cars.map((car) => ({
    ...car,
    _id: car._id.toString(),
  }));

  return (
    <>
      <CarToast toastType={toastType} />

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">Cars</h1>
          <Link
            href="/admin/operations/cars/new"
            className="w-full sm:w-auto text-center bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm sm:text-base"
          >
            Add New Car
          </Link>
        </div>

        <CarsTable cars={serializedCars} />
      </div>
    </>
  );
}
