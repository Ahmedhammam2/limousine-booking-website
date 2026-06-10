import Car from "@/models/cars";
import connectDB from "@/lib/mongodb";

export async function GET(req, context) {
  try {
    await connectDB();

    // Retrieve car ID from route parameters
    const { id } = await context.params;

    // Fetch car by ID
    const car = await Car.findById(id);

    if (!car) {
      return new Response("Car not found", { status: 404 });
    }

    return new Response(JSON.stringify(car), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Error fetching car", { status: 500 });
  }
}
