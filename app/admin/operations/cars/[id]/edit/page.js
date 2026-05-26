import { notFound } from "next/navigation";
import EditCarForm from "@/components/admin/EditCarForm";
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

        <EditCarForm car={car} carId={carId} />
      </div>
    </div>
  );
}
