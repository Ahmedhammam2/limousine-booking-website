/**
 * Get start and end dates for various time periods
 * Used throughout the analytics dashboard for filtering data
 */
export function getDateRanges() {
  const now = new Date();
  
  // Current UTC time values
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();

  // Calculate start of current week (Monday) using UTC
  // now.getUTCDay(): 0=Sun, 1=Mon...
  const day = now.getUTCDay();
  const diff = utcDate - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(Date.UTC(utcYear, utcMonth, diff, 0, 0, 0, 0));

  // Week ends on Sunday
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  // First day of current month (UTC)
  const monthStart = new Date(Date.UTC(utcYear, utcMonth, 1, 0, 0, 0, 0));
  // Last day of current month (UTC)
  const monthEnd = new Date(Date.UTC(utcYear, utcMonth + 1, 0, 23, 59, 59, 999));

  // January 1st of current year (UTC)
  const yearStart = new Date(Date.UTC(utcYear, 0, 1, 0, 0, 0, 0));
  // December 31st of current year (UTC)
  const yearEnd = new Date(Date.UTC(utcYear, 11, 31, 23, 59, 59, 999));

  // Yesterday's date range (UTC)
  const yesterday = new Date(Date.UTC(utcYear, utcMonth, utcDate - 1, 0, 0, 0, 0));
  const yesterdayEnd = new Date(Date.UTC(utcYear, utcMonth, utcDate - 1, 23, 59, 59, 999));

  // Previous week for growth comparison (UTC)
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setUTCDate(weekStart.getUTCDate() - 7);
  const lastWeekEnd = new Date(weekEnd);
  lastWeekEnd.setUTCDate(weekEnd.getUTCDate() - 7);

  // Previous month for growth comparison (UTC)
  const lastMonthStart = new Date(Date.UTC(utcYear, utcMonth - 1, 1, 0, 0, 0, 0));
  const lastMonthEnd = new Date(Date.UTC(utcYear, utcMonth, 0, 23, 59, 59, 999));

  // Previous year for growth comparison (UTC)
  const lastYearStart = new Date(Date.UTC(utcYear - 1, 0, 1, 0, 0, 0, 0));
  const lastYearEnd = new Date(Date.UTC(utcYear - 1, 11, 31, 23, 59, 59, 999));

  // Six months ago for trend analysis (UTC)
  const sixMonthsAgo = new Date(Date.UTC(utcYear, utcMonth - 6, 1, 0, 0, 0, 0));

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
