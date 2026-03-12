import { Trash, Pen } from "lucide-react";
import React from "react";
import AutocompleteInput from "./AutoCompleteInput";

/**
 * LocationInput
 * -------------
 * Handles pickup, dropoff, and intermediate stop location inputs
 * Provides add/remove functionality for dynamic stops
 */
export default function LocationInput({
  pickUp,
  dropOff,
  stops,
  onPickUpChange,
  onDropOffChange,
  onStopsChange,
  pickUpError,
  dropOffError,
  stopsError,
}) {
  return (
    <div className="text-black space-y-4 sm:space-y-6">
      {/* Pickup Location */}
      <div className="relative">
        <AutocompleteInput
          value={pickUp}
          onChange={onPickUpChange}
          placeholder="Pickup Location"
          className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:border-black transition"
        />

        {/* Search Icon - positioned absolutely for visual consistency */}
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        {/* Pen Icon - indicates editability */}
        <Pen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>

      {pickUpError && (
        <p className="text-red-500 text-xs sm:text-sm mt-1">{pickUpError}</p>
      )}

      {/* Stops List - dynamically render based on stops array */}
      <div className="space-y-3 sm:space-y-4">
        {stops.map((stop, index) => (
          <React.Fragment key={index}>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-grow">
                <AutocompleteInput
                  value={stop}
                  onChange={(v) => {
                    // Create new array to trigger re-render
                    const updated = [...stops];
                    updated[index] = v;
                    onStopsChange(updated);
                  }}
                  placeholder={`Stop #${index + 1}`}
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-12 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:border-black transition"
                />

                {/* Search Icon */}
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                {/* Pen Icon */}
                <Pen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Trash Button - filter out current index to remove stop */}
              <button
                onClick={() =>
                  onStopsChange(stops.filter((_, i) => i !== index))
                }
                className="p-1.5 sm:p-2 rounded-md bg-black text-white hover:bg-white hover:text-black border border-black transition flex-shrink-0"
              >
                <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Stop Error - only show for empty stops when validation fails */}
            {stopsError && stop.trim() === "" && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                Stop #{index + 1} must have a valid location
              </p>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Dropoff Location */}
      <div className="relative">
        <AutocompleteInput
          value={dropOff}
          onChange={onDropOffChange}
          placeholder="Dropoff Location"
          className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:border-black transition"
        />

        {/* Search Icon */}
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        {/* Pen Icon */}
        <Pen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>

      {dropOffError && (
        <p className="text-red-500 text-xs sm:text-sm mt-1">{dropOffError}</p>
      )}

      {/* Add Stop Button - appends empty string to stops array */}
      <button
        type="button"
        onClick={() => onStopsChange([...stops, ""])}
        className="text-black text-sm sm:text-base font-semibold underline hover:text-gray-700 transition"
      >
        + Add Stop
      </button>
    </div>
  );
}
