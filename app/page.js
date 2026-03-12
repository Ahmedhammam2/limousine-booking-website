// Home page component nothing important just links to fleet and booking pages
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen bg-black">
        <h1 className="text-6xl font-bold text-white mb-8">Home Page</h1>
        {/* Navigation Links */}
        <div className="flex space-x-6 justify-center my-8">
          <Link
            href="/fleet"
            className="px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-200 hover:transition"
          >
            Fleet
          </Link>

          <Link
            href="/booking"
            className="px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-200 hover:transition"
          >
            Book Now
          </Link>
        </div>

        {/* Page Content */}
      </main>
    </>
  );
}
