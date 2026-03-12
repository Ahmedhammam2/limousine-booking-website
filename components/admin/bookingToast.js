"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function BookingToast({ toastType }) {
  const router = useRouter();
  const hasShown = useRef(false);

  useEffect(() => {
    if (!toastType || hasShown.current) return;

    hasShown.current = true;

    if (toastType === "deleted") {
      toast.success("Booking deleted successfully");
    }

    if (toastType === "no_show") {
      toast.success("Booking marked as no show");
    }

    if (toastType === "updated") {
      toast.success("Booking updated successfully");
    }

    router.replace("/admin/operations/bookings");
  }, [toastType, router]);

  return null;
}
