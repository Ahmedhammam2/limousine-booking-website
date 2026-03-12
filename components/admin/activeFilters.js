import Link from "next/link";

export function BookingFilters({ activeFilter }) {
  const baseClass = "px-4 py-2 rounded border transition";

  const activeClass = "bg-black text-white";

  const inactiveClass = "bg-white text-black";

  return (
    // Flex container that wraps on mobile, stays horizontal on larger screens
    <div className="flex flex-wrap gap-2">
      <Link
        href="/admin/operations/bookings?filter=all"
        className={`${baseClass} ${
          activeFilter === "all" ? activeClass : inactiveClass
        }`}
      >
        {/* Show short text on mobile, full text on medium screens and up */}
        <span className="md:hidden">All</span>
        <span className="hidden md:inline">All Bookings</span>
      </Link>

      <Link
        href="/admin/operations/bookings?filter=this_week"
        className={`${baseClass} ${
          activeFilter === "this_week" ? activeClass : inactiveClass
        }`}
      >
        This Week
      </Link>

      <Link
        href="/admin/operations/bookings?filter=this_month"
        className={`${baseClass} ${
          activeFilter === "this_month" ? activeClass : inactiveClass
        }`}
      >
        This Month
      </Link>
    </div>
  );
}
