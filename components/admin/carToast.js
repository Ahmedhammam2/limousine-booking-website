"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CarToast({ toastType }) {
  const router = useRouter();

  useEffect(() => {
    if (!toastType) return;

    if (toastType === "added") {
      toast.success("car added successfully");
    }

    if (toastType === "edited") {
      toast.success("car edited successfully");
    }

    router.replace("/admin/operations/cars");
  }, [toastType, router]);

  return null;
}
