"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Round time to nearest interval (default 5 minutes)
 * Prevents times like 3:47 PM, ensures 3:45 or 3:50
 */
function roundToInterval(date, interval = 5) {
  const d = new Date(date);
  const minutes = d.getMinutes();
  const remainder = minutes % interval;
  if (remainder !== 0) d.setMinutes(minutes + (interval - remainder), 0, 0);
  return d;
}

/**
 * Create a Date with same Y/M/D as baseDate and time from timeDate
 * Necessary because react-datepicker can return dates with wrong day
 */
function makeDateOnSameDay(baseDate, timeDate) {
  if (!baseDate || !timeDate) return null;
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    timeDate.getHours(),
    timeDate.getMinutes(),
    0,
    0,
  );
}

/**
 * TimePickerField
 * ---------------
 * Time selection component with validation
 * - Disabled until date is selected
 * - Prevents past times for today
 * - 5-minute intervals for cleaner selection
 */
export default function TimePickerField({
  value,
  onChange,
  selectedDate,
  error,
}) {
  const now = new Date();

  // Show disabled input if no date selected yet
  if (!selectedDate) {
    return (
      <div className="relative w-full">
        <input
          disabled
          className="w-full pl-9 sm:pl-10 pr-2 sm:pr-3 py-2 text-sm sm:text-base border rounded-md bg-gray-100 text-gray-400"
          placeholder="Select date first"
        />
      </div>
    );
  }

  const isToday = selectedDate.toDateString() === now.toDateString();

  // Create base date for min/max time calculations
  const base = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );

  // For today: minimum time is current time (rounded up)
  // For future dates: allow full day (00:00 - 23:55)
  const minTime = isToday
    ? roundToInterval(now)
    : new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
  const maxTime = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    23,
    55,
    0,
    0,
  );

  // Wrap onChange to ensure returned time is on correct day
  const handleTimeChange = (timeDate) => {
    if (!timeDate) {
      onChange(null);
      return;
    }
    const normalized = makeDateOnSameDay(base, timeDate);
    onChange(normalized);
  };

  return (
    <div className="relative w-full">
      <DatePicker
        selected={value}
        onChange={handleTimeChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={5} // 5-minute increments
        timeCaption="Time"
        timeFormat="HH:mm"
        dateFormat="HH:mm"
        minTime={minTime}
        maxTime={maxTime}
        className={`w-full pl-9 sm:pl-10 pr-2 sm:pr-3 py-2 text-sm sm:text-base border rounded-md bg-white text-black 
          focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : ""}`}
      />
    </div>
  );
}
