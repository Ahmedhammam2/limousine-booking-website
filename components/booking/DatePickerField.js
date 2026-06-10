"use client";
import DatePicker from "react-date-picker";

/**
 * DatePickerField
 * ---------------
 * Date selection component
 * Restricts selection to current date and future dates only
 */
export default function DatePickerField({ value, onChange }) {
  return (
    <>
      <div className="w-full">
        <div className="border rounded-md px-2 sm:px-3 py-2 bg-white text-black focus-within:ring-2 focus-within:ring-blue-500 flex-shrink-0">
          <DatePicker
            onChange={onChange}
            value={value}
            minDate={new Date()} // Prevent past date selection
            required
            clearIcon={null} // Remove clear button for cleaner UI
            className="text-black w-full text-sm sm:text-base"
          />
        </div>
      </div>
    </>
  );
}
