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
  // Shared container style for the unified "1 square" look
  const containerClass =
    "flex items-center border border-[#333333] rounded-md overflow-hidden bg-white shadow-sm";

  // Shared button style (no individual borders)
  const btnClass =
    "px-3 sm:px-4 py-1.5 text-sm sm:text-base text-black font-semibold transition-colors duration-200 hover:bg-black hover:text-white flex-shrink-0";

  // Number display style (internal vertical borders)
  const numberClass =
    "px-3 sm:px-4 py-1.5 text-sm sm:text-base border-x border-[#333333] text-black font-semibold text-center min-w-[3rem] sm:min-w-[3.5rem] bg-gray-50";

  return (
    <div className="text-gray-700 flex flex-col sm:flex-row gap-4 sm:gap-8 mt-4 transition-all duration-500 ease-out opacity-100 transform translate-y-0">
      {/* Hours Block */}
      <div className="flex flex-col items-center sm:items-start">
        <label className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
          Trip Duration Hours
        </label>
        <div className={containerClass}>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newHours = hours - 1;
              if (newHours >= 2) onHoursChange(newHours);
            }}
          >
            -
          </button>
          <div className={numberClass}>{hours}</div>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newHours = hours + 1;
              if (newHours <= 12) onHoursChange(newHours);
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Minutes Block */}
      <div className="flex flex-col items-center sm:items-start">
        <label className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
          Trip Duration Minutes
        </label>
        <div className={containerClass}>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newMinutes = minutes - 5;
              if (newMinutes >= 0) onMinutesChange(newMinutes);
            }}
          >
            -
          </button>
          <div className={numberClass}>{minutes}</div>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newMinutes = minutes + 5;
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
