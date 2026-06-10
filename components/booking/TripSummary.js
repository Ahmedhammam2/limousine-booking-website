"use client";

export default function TripSummary({
  tripType,
  pickupLocation,
  dropoffLocation,
  stops,
  pickupDate,
  pickupTime,
  hourlyDuration,
  distanceMiles,
  passengers,
  kids,
  luggage,
  duration,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Trip Summary</h2>

      <div className="space-y-2 text-sm text-gray-700">
        <div>
          <span className="font-medium text-gray-500">Trip Type:</span>{" "}
          {tripType}
        </div>
        <div>
          <span className="font-medium text-gray-500">Pickup Date:</span>{" "}
          {String(pickupDate)}
        </div>
        <div>
          <span className="font-medium text-gray-500">Pickup Time:</span>{" "}
          {String(pickupTime)}
        </div>

        <div className="pt-2">
          <span className="font-medium text-gray-500">Route:</span>
          <div className="ml-4 mt-2 space-y-1 text-gray-700">
            <div>{pickupLocation}</div>
            {stops.map((stop, i) => (
              <div key={i}>{stop}</div>
            ))}
            <div>{dropoffLocation}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-3 text-gray-700">
          <span>{passengers} Passengers</span>
          <span>{kids} Kids</span>
          <span>{luggage} Luggage</span>
        </div>

        <div className="pt-3 space-y-1">
          {tripType === "transfer" && (
            <>
              <div>
                <span className="font-medium text-gray-500">
                  Estimated Distance:
                </span>{" "}
                {distanceMiles} miles
              </div>
              <div>
                <span className="font-medium text-gray-500">
                  Estimated Time:
                </span>{" "}
                {duration} hrs
              </div>
            </>
          )}

          {tripType === "hourly" && (
            <div>
              <span className="font-medium text-black">Booked Duration:</span>{" "}
              {hourlyDuration}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
