"use client";

/**
 * AlertBanner Component
 * Displays system alerts for critical business metrics
 * Only renders if there are alerts to show
 *
 * Props:
 * - alerts: Array of alert objects with id, type, message, metric
 */
export default function AlertBanner({ alerts }) {
  // Don't render anything if no alerts
  if (alerts.length === 0) return null;

  /**
   * Get styling based on alert severity
   * Critical = red, Warning = yellow, Info = blue
   */
  const getAlertStyles = (type) => {
    switch (type) {
      case "critical":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-600",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: "text-yellow-600",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "text-blue-600",
        };
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);

        return (
          <div
            key={alert.id}
            className={`${styles.bg} ${styles.border} border rounded-lg p-4`}
          >
            <div className="flex items-start">
              {/* Warning icon */}
              <div className="flex-shrink-0">
                <svg
                  className={`h-5 w-5 ${styles.icon}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Alert message */}
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${styles.text}`}>
                  {alert.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
