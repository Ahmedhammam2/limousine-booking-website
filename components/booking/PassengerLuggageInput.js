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
  // Shared button style
  const btnClass =
    "px-2 sm:px-3 py-1 text-sm sm:text-base border border-black bg-white text-black font-semibold transition-colors duration-200 hover:bg-black hover:text-white";

  // Number display style
  const numberClass =
    "px-3 sm:px-4 py-1 text-sm sm:text-base border border-black bg-white text-black font-semibold text-center min-w-[2.5rem] sm:min-w-[3rem]";

  return (
    <div className="text-gray-700 flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
      {/* Passengers block - minimum 1 required */}
      <div className="flex flex-col items-center">
        <label className="text-xs sm:text-sm font-medium mb-1">
          Passengers
        </label>
        <div className="flex items-center">
          <button
            className={btnClass}
            onClick={() => {
              const newPas = passengers - 1;
              // Prevent going below 1 passenger
              if (newPas >= 1) onPassengersChange(newPas);
            }}
          >
            -
          </button>
          <div className={numberClass}>{passengers}</div>
          <button
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
      <div className="flex flex-col items-center">
        <label className="text-xs sm:text-sm font-medium mb-1">Kids</label>
        <div className="flex items-center">
          <button
            className={btnClass}
            onClick={() => {
              const newKids = kids - 1;
              // Prevent negative values
              if (newKids >= 0) onKidsChange(newKids);
            }}
          >
            -
          </button>
          <div className={numberClass}>{kids}</div>
          <button
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
      <div className="flex flex-col items-center">
        <label className="text-xs sm:text-sm font-medium mb-1">Luggage</label>
        <div className="flex items-center">
          <button
            className={btnClass}
            onClick={() => {
              const newLuggage = luggage - 1;
              // Prevent negative values
              if (newLuggage >= 0) onLuggageChange(newLuggage);
            }}
          >
            -
          </button>
          <div className={numberClass}>{luggage}</div>
          <button
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
