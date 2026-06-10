"use client";

import { Car, Clock } from "lucide-react";

/**
 * TripTypeSelector
 * ----------------
 * Toggle between Transfer and Hourly trip types
 * Visual feedback with icon and color change
 */
export default function TripTypeSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 justify-end w-full sm:w-auto">
      {/* TRANSFER BUTTON */}
      <button
        onClick={() => onChange("transfer")}
        className={`
          flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial
          px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium border
          transition
          ${
            value === "transfer"
              ? "bg-black text-white border-black"
              : "bg-gray-200 text-gray-700 border-gray-300"
          }
        `}
      >
        <Car size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="whitespace-nowrap">Transfer</span>
      </button>

      {/* HOURLY BUTTON */}
      <button
        onClick={() => onChange("hourly")}
        className={`
          flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial
          px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium border
          transition
          ${
            value === "hourly"
              ? "bg-black text-white border-black"
              : "bg-gray-200 text-gray-700 border-gray-300"
          }
        `}
      >
        <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="whitespace-nowrap">Hourly</span>
      </button>
    </div>
  );
}
