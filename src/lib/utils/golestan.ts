import type { WeekType } from '@/types/course';
import type {
  GolestanTimeSlot,
  NormalizedCourseSession,
} from '@/types/golestan';

export interface ParsedExamTime {
  date: string;  // e.g. "1404/11/06"
  start: number; // minutes since midnight
  end: number;   // minutes since midnight
}

/**
 * Convert a time string "HH:MM" to minutes since midnight.
 * Returns NaN if the input is invalid.
 */
export function timeToMinutes(timeStr: string | null | undefined): number {
  if (timeStr == null) return NaN;
  const trimmed = timeStr.trim();
  if (!trimmed) return NaN;

  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return NaN;

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return NaN;
  }

  return hours * 60 + minutes;
}

/**
 * Parse exam time strings of the form:
 *   "1404/11/06 - 13:30-15:30"
 *
 * Returns null if parsing fails.
 */
export function parseExamTime(
  examStr: string | null | undefined,
): ParsedExamTime | null {
  if (examStr == null) return null;
  const text = examStr.trim();
  if (!text) return null;

  // Match: YYYY/MM/DD ... HH:MM-HH:MM
  const match = text.match(
    /(\d{4}\/\d{2}\/\d{2}).*?(\d{2}:\d{2})-(\d{2}:\d{2})/,
  );
  if (!match) return null;

  const [, date, startStr, endStr] = match;
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return { date, start, end };
}

/**
 * Generic time interval overlap:
 * returns true if [start1, end1) and [start2, end2) intersect.
 * Mirrors Python's overlap() in course_utils.py.
 */
export function checkTimeOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number,
): boolean {
  return !(end1 <= start2 || end2 <= start1);
}

/**
 * Map Golestan parity flag to WeekType used in the UI:
 * - '' or unknown → 'both'
 * - 'ف' (fard / odd) → 'odd'
 * - 'ز' (zoj / even) → 'even'
 */
export function parityToWeekType(parity: string | null | undefined): WeekType {
  const p = (parity || '').trim();
  if (p === 'ف') return 'odd';
  if (p === 'ز') return 'even';
  return 'both';
}

/**
 * Check if two parity flags (Golestan-style) conflict.
 *
 * Semantics:
 * - 'ف' conflicts with 'ف' and with any "both" (including empty/unknown)
 * - 'ز' conflicts with 'ز' and with any "both"
 * - 'both' (empty/unknown) conflicts with any non-compatible parity
 *
 * The only compatible combination is explicitly odd vs even.
 */
export function checkParityConflict(
  parity1: string | null | undefined,
  parity2: string | null | undefined,
): boolean {
  const p1 = (parity1 || '').trim();
  const p2 = (parity2 || '').trim();

  // Treat empty as "both"
  const isOdd = (p: string) => p === 'ف';
  const isEven = (p: string) => p === 'ز';
  const isBoth = (p: string) => p === '' || (!isOdd(p) && !isEven(p));

  // Odd vs even is compatible (no conflict)
  if (
    (isOdd(p1) && isEven(p2)) ||
    (isEven(p1) && isOdd(p2))
  ) {
    return false;
  }

  // Any other combination conflicts:
  // - odd vs odd
  // - even vs even
  // - odd vs both
  // - even vs both
  // - both vs both
  return true;
}

/**
 * Convert Persian weekday name to a day index compatible with the UI grid.
 *
 * UI uses 6 columns:
 *   0: شنبه
 *   1: یک‌شنبه / یکشنبه
 *   2: دوشنبه
 *   3: سه‌شنبه
 *   4: چهارشنبه
 *   5: پنج‌شنبه
 *
 * جمعه (Friday) is not represented and will return null.
 */
export function dayNameToIndex(dayName: string | null | undefined): number | null {
  if (!dayName) return null;

  // Normalize Arabic forms and remove spaces/ZWNJ to create a compact key
  let key = dayName
    .replace(/\s+/g, '')
    .replace(/\u200c/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .trim();

  switch (key) {
    case 'شنبه':
      return 0;
    case 'یکشنبه':
    case 'يكشنبه':
      return 1;
    case 'دوشنبه':
      return 2;
    case 'سهشنبه':
      return 3; // سه‌شنبه
    case 'چهارشنبه':
      return 4;
    case 'پنجشنبه':
      return 5; // پنج‌شنبه
    case 'جمعه':
      return null; // Friday not shown in current grid
    default:
      return null;
  }
}

/**
 * Convert a raw GolestanTimeSlot into a NormalizedCourseSession that
 * aligns with the UI's CourseSession grid representation.
 *
 * - Time strings are converted to minutes, then mapped to integer hour slots.
 *   We floor the start and ceil the end so that any partial overlap is
 *   conservatively treated as occupying the full hours it touches.
 */
export function golestanTimeSlotToNormalizedSession(
  slot: GolestanTimeSlot,
): NormalizedCourseSession | null {
  const dayIndex = dayNameToIndex(slot.day);
  if (dayIndex == null) return null;

  const startMinutes = timeToMinutes(slot.start);
  const endMinutes = timeToMinutes(slot.end);

  if (
    !Number.isFinite(startMinutes) ||
    !Number.isFinite(endMinutes) ||
    endMinutes <= startMinutes
  ) {
    return null;
  }

  const startHour = Math.floor(startMinutes / 60);
  const endHour = Math.ceil(endMinutes / 60);

  return {
    dayIndex,
    startHour,
    endHour,
    location: slot.location,
    weekType: parityToWeekType(slot.parity),
  };
}