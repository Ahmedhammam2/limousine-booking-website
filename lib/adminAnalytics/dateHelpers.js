/**
 * Get start and end dates for various time periods
 * Used throughout the analytics dashboard for filtering data
 */
export function getDateRanges() {
  const now = new Date();

  // Calculate start of current week (Monday)
  // If today is Sunday (0), go back 6 days to previous Monday
  // Otherwise go back to Monday of current week
  const weekStart = new Date(now);
  weekStart.setDate(
    now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
  );
  weekStart.setHours(0, 0, 0, 0);

  // Week ends on Sunday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // First day of current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  // Last day of current month (day 0 of next month)
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  // January 1st of current year
  const yearStart = new Date(now.getFullYear(), 0, 1);
  // December 31st of current year
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  // Yesterday's date range for comparison
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);

  // Previous week for growth comparison
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);

  const lastWeekEnd = new Date(weekEnd);
  lastWeekEnd.setDate(weekEnd.getDate() - 7);

  // Previous month for growth comparison
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  // Previous year for growth comparison
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

  // Six months ago for trend analysis
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  return {
    thisWeek: { start: weekStart, end: weekEnd },
    thisMonth: { start: monthStart, end: monthEnd },
    thisYear: { start: yearStart, end: yearEnd },
    yesterday: { start: yesterday, end: yesterdayEnd },
    lastWeek: { start: lastWeekStart, end: lastWeekEnd },
    lastMonth: { start: lastMonthStart, end: lastMonthEnd },
    lastYear: { start: lastYearStart, end: lastYearEnd },
    sixMonthsAgo,
  };
}

/**
   Calculate percentage growth between two numbers
   Returns 100% if previous is 0 and current > 0
   Returns 0% if both are 0
 */
export function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Format number as US dollar currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number as percentage with + or - prefix
export function formatPercentage(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

// Convert day number to day name

export function getDayName(dayOfWeek) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayOfWeek];
}

// Convert month number to month name
export function getMonthName(month) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
}

/**
  Calculate duration in hours between two dates
  Used for trip duration calculations
 */
export function calculateDurationHours(startTime, endTime) {
  const diffMs = endTime.getTime() - startTime.getTime();
  return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

/**
 * Determine if a booking falls within peak hours
 * Peak hours defined as:
 * - All day Saturday
 * - Friday 4 PM - 11 PM
 * - Weekday mornings 6 AM - 9 AM
 * - Weekday evenings 4 PM - 7 PM
 * - Sunday evening 4 PM - 8 PM
 */
export function isPeakTime(date) {
  const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
  const hour = date.getHours(); // 0-23

  // Saturday is all peak
  if (dayOfWeek === 6) return true;

  // Friday evening (4 PM - 11 PM)
  if (dayOfWeek === 5 && hour >= 16 && hour < 23) return true;

  // Weekday morning rush (6 AM - 9 AM)
  if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 6 && hour < 9) return true;

  // Weekday evening rush (4 PM - 7 PM)
  if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 16 && hour < 19) return true;

  // Sunday evening (4 PM - 8 PM)
  if (dayOfWeek === 0 && hour >= 16 && hour < 20) return true;

  return false;
}
