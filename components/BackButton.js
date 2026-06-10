"use client";
import { useRouter } from "next/navigation";

export default function BackButton({ className, children }) {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className={className}>
      {children || "Back"}
    </button>
  );
}
