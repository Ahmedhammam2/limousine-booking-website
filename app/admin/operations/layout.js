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

  // SWR pings your API endpoint quietly every 6000ms (6 seconds)
  const { data, mutate } = useSWR("/api/bookings", fetcher, { refreshInterval: 6000 });

  // Tracking the full array of previous bookings instead of just a number count
  const [previousBookings, setPreviousBookings] = useState([]);

  useEffect(() => {
    // If the database has a slow response or hasn't loaded data yet, stop here
    if (!data || !data.bookings) return;

    // 1. Check for a brand NEW booking (array length grew)
    if (previousBookings.length > 0 && data.bookings.length > previousBookings.length) {
      const alertSound = new Audio("/sounds/notification.mp3");
      alertSound.play().catch(() =>
        console.log("Audio alert blocked by browser until initial user interaction.")
      );

      toast.success(" New booking added!", {
        duration: 6000,
        style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" }
      });
      mutate();
    }

    // Loop through old records to catch column updates (STATUS, PAYMENT, AMOUNT)
    previousBookings.forEach((oldRow) => {
      // Find the exact same document in the fresh data snapshot
      const freshRow = data.bookings.find((b) => b._id === oldRow._id);

      if (freshRow) {
        // Check if PAYMENT status flipped from unpaid to paid or status changed
        if ((oldRow.paymentStatus === "unpaid" && freshRow.paymentStatus === "paid") || (oldRow.status !== freshRow.status)) {
          const alertSound = new Audio("/sounds/notification.mp3");
          alertSound.play().catch(() => { });

          toast.success(`Booking updated from ${freshRow.customerName} in row ${freshRow._id}    `, {
            duration: 6000,
            style: { background: "#16a34a", color: "#fff" }
          });
          mutate();
        }

        // Checks if finalPrice, locations, customer data, times, or fields from your schema changed
        if (
          oldRow.finalPrice !== freshRow.finalPrice ||
          oldRow.customerName !== freshRow.customerName ||
          oldRow.customerPhone !== freshRow.customerPhone ||
          oldRow.customerEmail !== freshRow.customerEmail ||
          oldRow.date !== freshRow.date ||
          oldRow.startTime !== freshRow.startTime ||
          oldRow.endTime !== freshRow.endTime ||
          oldRow.carId !== freshRow.carId ||
          oldRow.pickupLocation !== freshRow.pickupLocation ||
          oldRow.dropoffLocation !== freshRow.dropoffLocation ||
          oldRow.tripType !== freshRow.tripType ||
          oldRow.passengers !== freshRow.passengers ||
          oldRow.luggage !== freshRow.luggage
        ) {
          toast.success(`Details updated for row ${freshRow._id}`, {
            duration: 5000,
          });
          mutate();
        }
      }
    });

    // Save the current rows so we can compare them on the next 6-second tick
    setPreviousBookings(data.bookings);
  }, [data, mutate]);

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
        <Toaster position="top-right" />
      </div>
    </div>
  );
}