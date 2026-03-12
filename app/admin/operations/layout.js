"use client";

import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      {/* Mobile sidebar overlay - only shows when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - slides in on mobile, always visible on desktop */}
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
          {/* Close button for mobile */}
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
          {/* Mobile menu button */}
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
