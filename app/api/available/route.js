import { getAvailableCars } from "@/lib/availability";

export async function POST(req) {
  try {
    // Receive booking requirements from frontend
    const bookingData = await req.json();

    // Calculate vehicle availability based on time overlap and constraints
    const result = await getAvailableCars(bookingData);

    // Always return a predictable response shape
    return Response.json({
      cars: result?.cars ?? [],
    });
  } catch (error) {
    console.error("API /available error:", error);

    // Prevent frontend crashes by always returning JSON
    return Response.json(
      { error: "Failed to fetch available cars" },
      { status: 500 },
    );
  }
}
