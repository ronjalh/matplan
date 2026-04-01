/**
 * Date utilities — Norwegian conventions
 * Week starts Monday, ISO 8601 week numbers, dd.mm.yyyy format
 */

/** Get Monday of the week containing the given date */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  // We want Monday=0, so shift: (day + 6) % 7
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get array of 7 dates (Mon–Sun) for the week containing the given date */
export function getWeekDays(date: Date): Date[] {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/** Format date as ISO string yyyy-mm-dd */
export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Format date as Norwegian short: "man 1. apr" */
export function formatShortDate(date: Date): string {
  const days = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
  const months = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
  return `${days[date.getDay()]} ${date.getDate()}. ${months[date.getMonth()]}`;
}

/** Format date as dd.mm.yyyy */
export function formatNorwegianDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/** Get ISO 8601 week number */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Check if two dates are the same day */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

/** Check if date is today */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}
