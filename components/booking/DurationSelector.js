/**
 * DurationSelector
 * ----------------
 * Allows users to select trip duration for hourly bookings
 * Hours: 2-12 in 1-hour increments
 * Minutes: 0-55 in 5-minute increments
 */
export default function DurationSelector({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}) {
  // Shared button style for increment/decrement buttons
  const btnClass =
    "px-2 sm:px-3 py-1 text-sm sm:text-base border border-black bg-white text-black font-semibold transition-colors duration-200 hover:bg-black hover:text-white";

  // Number display style (non-interactive)
  const numberClass =
    "px-3 sm:px-4 py-1 text-sm sm:text-base border border-black bg-white text-black font-semibold text-center min-w-[2.5rem] sm:min-w-[3rem]";

  return (
    <div className="text-gray-700 flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 transition-all duration-500 ease-out opacity-100 transform translate-y-0">
      {/* Hours Block */}
      <div className="flex flex-col items-center">
        <label className="text-xs sm:text-sm font-medium mb-1">
          Trip Duration Hours
        </label>
        <div className="flex items-center">
          <button
            className={btnClass}
            onClick={() => {
              const newHours = hours - 1;
              // Minimum 2 hours for hourly trips
              if (newHours >= 2) onHoursChange(newHours);
            }}
          >
            -
          </button>
          <div className={numberClass}>{hours}</div>
          <button
            className={btnClass}
            onClick={() => {
              const newHours = hours + 1;
              // Maximum 12 hours for hourly trips
              if (newHours <= 12) onHoursChange(newHours);
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Minutes Block */}
      <div className="flex flex-col items-center">
        <label className="text-xs sm:text-sm font-medium mb-1">
          Trip Duration Minutes
        </label>
        <div className="flex items-center">
          <button
            className={btnClass}
            onClick={() => {
              const newMinutes = minutes - 5;
              // Minimum 0 minutes
              if (newMinutes >= 0) onMinutesChange(newMinutes);
            }}
          >
            -
          </button>
          <div className={numberClass}>{minutes}</div>
          <button
            className={btnClass}
            onClick={() => {
              const newMinutes = minutes + 5;
              // Maximum 55 minutes (increments of 5)
              if (newMinutes <= 55) onMinutesChange(newMinutes);
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
