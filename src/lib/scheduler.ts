import type { Course, WeekType } from '@/types/course';
import { timeToMinutes, checkTimeOverlap } from '@/lib/utils/golestan';

export interface ConflictResult {
  hasConflict: boolean;
  reason?: string;
  conflictWith?: string;
}

/**
 * Check if two WeekType values conflict.
 * Semantics:
 * - 'both' conflicts with any concrete type
 * - concrete types conflict with themselves
 * - 'odd' vs 'even' is compatible
 */
function weekTypesConflict(type1: WeekType, type2: WeekType): boolean {
  if (type1 === 'both' || type2 === 'both') return true;
  return type1 === type2;
}

/**
 * Check time conflict between two courses based on their sessions.
 * Uses timeToMinutes + checkTimeOverlap from golestan utils.
 */
function hasTimeConflict(
  current: Course[],
  candidate: Course,
): ConflictResult {
  for (const existing of current) {
    for (const newSession of candidate.sessions) {
      for (const existingSession of existing.sessions) {
        if (newSession.day !== existingSession.day) continue;

        const start1 = timeToMinutes(`${newSession.startTime.toString().padStart(2, '0')}:00`);
        const end1 = timeToMinutes(`${newSession.endTime.toString().padStart(2, '0')}:00`);
        const start2 = timeToMinutes(`${existingSession.startTime.toString().padStart(2, '0')}:00`);
        const end2 = timeToMinutes(`${existingSession.endTime.toString().padStart(2, '0')}:00`);

        if (!Number.isFinite(start1) || !Number.isFinite(end1) ||
            !Number.isFinite(start2) || !Number.isFinite(end2)) {
          continue;
        }

        if (!checkTimeOverlap(start1, end1, start2, end2)) {
          continue;
        }

        if (weekTypesConflict(newSession.weekType, existingSession.weekType)) {
          return {
            hasConflict: true,
            reason: 'time',
            conflictWith: existing.name,
          };
        }
      }
    }
  }
  return { hasConflict: false };
}

/**
 * Very lightweight exam conflict: treat equal date + equal time as conflict.
 * This matches the current ExamScheduleDialog behavior and can be refined
 * later to use precise minute ranges if needed.
 */
function hasExamConflict(
  current: Course[],
  candidate: Course,
): ConflictResult {
  if (!candidate.examDate || !candidate.examTime) {
    return { hasConflict: false };
  }

  for (const existing of current) {
    if (!existing.examDate || !existing.examTime) continue;

    const sameDate = existing.examDate === candidate.examDate;
    const sameTime =
      existing.examTime === candidate.examTime &&
      existing.examTime !== 'اعلام نشده';

    if (sameDate && sameTime) {
      return {
        hasConflict: true,
        reason: 'exam',
        conflictWith: existing.name,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * High-level conflict checker used by the UI.
 * Checks both class-time conflicts and exam-time conflicts.
 */
export function hasConflict(
  currentSchedule: Course[],
  newCourse: Course,
): ConflictResult {
  const timeConflict = hasTimeConflict(currentSchedule, newCourse);
  if (timeConflict.hasConflict) return timeConflict;

  const examConflict = hasExamConflict(currentSchedule, newCourse);
  if (examConflict.hasConflict) return examConflict;

  return { hasConflict: false };
}