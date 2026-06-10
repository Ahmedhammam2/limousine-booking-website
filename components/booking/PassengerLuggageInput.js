/**
 * PassengerLuggageInput
 * ---------------------
 * Increment/decrement controls for passengers, kids, and luggage
 * Passengers: minimum 1, no maximum
 * Kids & Luggage: minimum 0, no maximum
 */
export default function PassengerLuggageInput({
  passengers,
  luggage,
  kids,
  onPassengersChange,
  onLuggageChange,
  onKidsChange,
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
    <div className="text-gray-700 flex flex-col sm:flex-row gap-4 sm:gap-8 mt-4">
      {/* Passengers block - minimum 1 required */}
      <div className="flex flex-col items-center sm:items-start">
        <label className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
          Passengers
        </label>
        <div className={containerClass}>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newPas = passengers - 1;
              if (newPas >= 1) onPassengersChange(newPas);
            }}
          >
            -
          </button>
          <div className={numberClass}>{passengers}</div>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newPas = passengers + 1;
              onPassengersChange(newPas);
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Kids Block - minimum 0 */}
      <div className="flex flex-col items-center sm:items-start">
        <label className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
          Kids
        </label>
        <div className={containerClass}>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newKids = kids - 1;
              if (newKids >= 0) onKidsChange(newKids);
            }}
          >
            -
          </button>
          <div className={numberClass}>{kids}</div>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newKids = kids + 1;
              onKidsChange(newKids);
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Luggage Block - minimum 0 */}
      <div className="flex flex-col items-center sm:items-start">
        <label className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
          Luggage
        </label>
        <div className={containerClass}>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newLuggage = luggage - 1;
              if (newLuggage >= 0) onLuggageChange(newLuggage);
            }}
          >
            -
          </button>
          <div className={numberClass}>{luggage}</div>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              const newLuggage = luggage + 1;
              onLuggageChange(newLuggage);
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
