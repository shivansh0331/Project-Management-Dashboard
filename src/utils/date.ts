import { format, differenceInCalendarDays, parseISO, isPast } from "date-fns";

/**
 * Formats an ISO date string or Date object into a readable format.
 */
export function formatDate(date: string | Date, formatStr: string = "MMM dd, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  try {
    return format(d, formatStr);
  } catch (error) {
    return "Invalid date";
  }
}

/**
 * Checks if a project deadline has passed.
 */
export function isOverdue(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  // If completed, it shouldn't show as overdue in UI context, but this function checks pure calendar date
  return isPast(d) && differenceInCalendarDays(d, new Date()) < 0;
}

/**
 * Calculates remaining days. Returns negative if past.
 */
export function daysRemaining(date: string | Date): number {
  const d = typeof date === "string" ? parseISO(date) : date;
  return differenceInCalendarDays(d, new Date());
}

/**
 * Returns input field date value string formatted as YYYY-MM-DD.
 */
export function toInputDateString(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  try {
    return format(d, "yyyy-MM-dd");
  } catch {
    return "";
  }
}
