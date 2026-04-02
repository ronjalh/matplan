import { describe, it, expect } from "vitest";
import {
  getMonday,
  getWeekDays,
  toISODate,
  formatShortDate,
  getISOWeekNumber,
  isToday,
  isSameDay,
} from "./date-utils";

// Use local dates to avoid UTC timezone offset issues
function localDate(y: number, m: number, d: number) {
  return new Date(y, m - 1, d);
}

describe("getMonday", () => {
  it("returns Monday for a Wednesday", () => {
    const wed = localDate(2026, 4, 1); // Wed April 1
    const mon = getMonday(wed);
    expect(mon.getDay()).toBe(1);
    expect(toISODate(mon)).toBe("2026-03-30");
  });

  it("returns same day for a Monday", () => {
    const mon = localDate(2026, 3, 30);
    expect(toISODate(getMonday(mon))).toBe("2026-03-30");
  });

  it("returns previous Monday for a Sunday", () => {
    const sun = localDate(2026, 4, 5);
    const mon = getMonday(sun);
    expect(toISODate(mon)).toBe("2026-03-30");
  });
});

describe("getWeekDays", () => {
  it("returns 7 days starting from Monday", () => {
    const days = getWeekDays(localDate(2026, 4, 1));
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1);
    expect(days[6].getDay()).toBe(0);
  });

  it("covers Mon through Sun", () => {
    const days = getWeekDays(localDate(2026, 4, 1));
    expect(toISODate(days[0])).toBe("2026-03-30");
    expect(toISODate(days[6])).toBe("2026-04-05");
  });
});

describe("getISOWeekNumber", () => {
  it("returns week 14 for April 1, 2026", () => {
    expect(getISOWeekNumber(localDate(2026, 4, 1))).toBe(14);
  });
});

describe("toISODate", () => {
  it("formats as yyyy-mm-dd", () => {
    expect(toISODate(localDate(2026, 4, 1))).toBe("2026-04-01");
  });
});

describe("formatShortDate", () => {
  it("formats as Norwegian short date", () => {
    const result = formatShortDate(localDate(2026, 4, 1));
    expect(result).toContain("1.");
    expect(result).toContain("apr");
  });
});

describe("isSameDay", () => {
  it("returns true for same day", () => {
    expect(isSameDay(localDate(2026, 4, 1), localDate(2026, 4, 1))).toBe(true);
  });

  it("returns false for different days", () => {
    expect(isSameDay(localDate(2026, 4, 1), localDate(2026, 4, 2))).toBe(false);
  });
});
