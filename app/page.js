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
            className="btn-secondary px-6 py-3 font-semibold shadow-md"
          >
            Fleet
          </Link>

          <Link
            href="/booking"
            className="btn-primary px-6 py-3 font-semibold shadow-md"
          >
            Book Now
          </Link>
        </div>

        {/* Page Content */}
      </main>
    </>
  );
}
