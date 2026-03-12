export default function PriceBreakDown({
  car,
  tripType,
  distance,
  finalPrice,
  billedHours,
  totalHours,
  basePrice,
  originalPrice,
}) {
  let difference = 0;
  if (originalPrice) {
    difference = finalPrice - originalPrice;
  }
  return (
    <div className="max-w-md mx-auto mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Price Breakdown
      </h3>

      {tripType == "transfer" && (
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">Base Rate</span>
            <span>${car.pricePermile} / mile</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Distance</span>
            <span>{distance} miles</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>${basePrice.toFixed(2)}</span>
          </div>

          {car.minprice > basePrice && (
            <div className="flex justify-between text-orange-600 font-medium">
              <span>Minimum Charge Applied</span>
              <span>${car.minprice}</span>
            </div>
          )}
          {originalPrice > 0 && (
            <div className="pt-4 border-t border-gray-200 space-y-3 text-sm">
              {/* Original Price */}
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Original Price (already paid)
                </span>
                <span className="font-medium">${originalPrice.toFixed(2)}</span>
              </div>

              {/* New Price */}
              <div className="flex justify-between">
                <span className="text-gray-500">Price After Editing</span>
                <span className="font-medium">${finalPrice.toFixed(2)}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200 pt-3" />

              {/* Result */}
              {difference > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Additional Payment</span>
                  <span>${difference.toFixed(2)}</span>
                </div>
              )}

              {difference < 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Refund</span>
                  <span>${Math.abs(difference).toFixed(2)}</span>
                </div>
              )}

              {difference === 0 && (
                <div className="text-center font-medium text-gray-700">
                  Price unchanged
                </div>
              )}
            </div>
          )}

          {!originalPrice && (
            <div className=" flex justify-between pt-4 border-t border-gray-200 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>${finalPrice ? finalPrice.toFixed(2) : "0.00"}</span>
            </div>
          )}
        </div>
      )}

      {tripType == "hourly" && (
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">Hourly Rate</span>
            <span>${car.pricePerHour} / hour</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Duration</span>
            <span>{totalHours.toFixed(2)} hrs</span>
          </div>

          {car.minHours > totalHours && (
            <div className="flex justify-between text-orange-600 font-medium">
              <span>Minimum Hours Applied</span>
              <span>{car.minHours} hrs</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-500">Billed Hours</span>
            <span>{billedHours.toFixed(2)} hrs</span>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200 text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>${finalPrice ? finalPrice.toFixed(2) : "0.00"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
