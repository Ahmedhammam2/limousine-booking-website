"use client";

import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";

// A small utility function that SWR needs to handle fetching and transforming data into JSON
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  //  SWR to ping API endpoint quietly every 6000ms (6 seconds)
  const { data } = useSWR("/api/bookings", fetcher, { refreshInterval: 6000 });

  //  Local memory to preserve the number of bookings during your session
  const [totalBookingsCount, setTotalBookingsCount] = useState(null);

  useEffect(() => {
    // If the database has a slow response or hasn't loaded data yet
    if (!data || !data.bookings) return;

    const currentCount = data.bookings.length;

    //  The Comparison Core: Trigger alerts ONLY if the new database count is larger than before
    if (totalBookingsCount !== null && currentCount > totalBookingsCount) {


      const alertSound = new Audio("/sounds/notification.mp3");
      alertSound.play().catch(() =>
        console.log("Audio alert was blocked by your browser until you interact with the page first.")
      );


      toast.success("New booking added!", {
        duration: 6000,
        style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" }
      });
    }

    //  Keep the tracker updated to match the new database array length
    setTotalBookingsCount(currentCount);
  }, [data, totalBookingsCount]);



  async function handleLogout() {
    const res = await fetch("/api/admin/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      router.push("/admin/login");
    } else {
      console.error("Logout failed");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-60 bg-white shadow-md p-6 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Admin Menu</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-2xl"
          >
            ×
          </button>
        </div>

        <Link
          href="/admin/operations/cars"
          className="mb-3 px-3 py-2 rounded hover:bg-gray-200 transition text-sm sm:text-base"
          onClick={() => setIsSidebarOpen(false)}
        >
          Cars
        </Link>
        <Link
          href="/admin/operations/bookings"
          className="mb-3 px-3 py-2 rounded hover:bg-gray-200 transition text-sm sm:text-base"
          onClick={() => setIsSidebarOpen(false)}
        >
          Bookings
        </Link>
        <Link
          href="/admin/operations/analytics"
          className="mb-3 px-3 py-2 rounded hover:bg-gray-200 transition text-sm sm:text-base"
          onClick={() => setIsSidebarOpen(false)}
        >
          Analytics
        </Link>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex justify-between items-center p-3 sm:p-4 bg-white shadow">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-2xl mr-3"
          >
            ☰
          </button>

          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            Admin Panel
          </h1>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black text-white rounded hover:bg-gray-800 transition text-sm sm:text-base"
          >
            Logout
          </button>
        </header>

        {/* Page content - scrollable area */}
        <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-auto">
          {children}
        </main>
        {/* The toast provider handles injecting the styling popups cleanly into view */}
        <Toaster position="top-right" />
      </div>
    </div>
  );
}