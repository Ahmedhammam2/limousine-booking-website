"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check if we have search params to retry the booking
  const hasParams = searchParams.size > 0;

  const backHandle = () => {
    if (!hasParams) return;
    // Reconstruct the confirm page URL with all previous booking details
    const retryUrl = `/booking/confirm?${searchParams.toString()}`;
    router.push(retryUrl);
  };

  const startOverHandle = () => {
    // Take user back to the beginning of the booking flow
    router.push("/booking");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3 sm:px-4">
      {/* Center card container with responsive width and padding */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center">
        {/* Warning icon with responsive sizing */}
        <div className="mx-auto mb-4 sm:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 sm:h-7 sm:w-7 text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
            />
          </svg>
        </div>

        {/* Responsive text sizing */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Your booking was not completed. You can try again or start a new
          booking.
        </p>

        {/* Action buttons with responsive spacing */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {/* Try Again button - disabled if no params to restore */}
          <button
            onClick={backHandle}
            disabled={!hasParams}
            className={`w-full rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition
              ${
                hasParams
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            Try Again
          </button>

          {/* Start Over button */}
          <button
            onClick={startOverHandle}
            className="w-full rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
