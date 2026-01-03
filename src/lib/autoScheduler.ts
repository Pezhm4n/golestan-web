import type { Course } from '@/types/course';
import { hasConflict as courseHasConflict } from '@/lib/scheduler';

export interface ScheduleCombination {
  courses: Course[];
  totalUnits: number;
  daysUsed: number;
  emptyHours: number;
  score: number;
}

/**
 * Calculate number of distinct teaching days used by a combination.
 */
function calculateDaysUsed(courses: Course[]): number {
  const days = new Set<number>();
  for (const c of courses) {
    for (const s of c.sessions) {
      days.add(s.day);
    }
  }
  return days.size;
}

/**
 * Calculate total empty time (gaps) in hours across all days for a combination.
 * This is simplified from the Python implementation but preserves the idea:
 * sort sessions within each day by start, and sum gaps larger than 15 minutes.
 */
function calculateEmptyHours(courses: Course[]): number {
  const byDay: Record<number, Array<{ start: number; end: number }>> = {};

  for (const c of courses) {
    for (const s of c.sessions) {
      if (!byDay[s.day]) byDay[s.day] = [];
      byDay[s.day].push({ start: s.startTime, end: s.endTime });
    }
  }

  let penalty = 0;
  for (const intervals of Object.values(byDay)) {
    intervals.sort((a, b) => a.start - b.start);
    for (let i = 0; i < intervals.length - 1; i++) {
      const gapHours = intervals[i + 1].start - intervals[i].end;
      // treat gaps > 0.25 hours (~15 minutes) as penalty
      if (gapHours > 0.25) {
        penalty += gapHours;
      }
    }
  }

  return penalty;
}

/**
 * Generate best non-conflicting combinations of courses.
 *
 * This is a simplified port of generate_best_combinations_for_groups from
 * the Python code. It assumes that courses belonging to the same logical
 * "group" share the same courseId. For each courseId, at most one course
 * can be selected in a combination.
 *
 * WARNING: This operates in O(k^n) where n is the number of groups and k is
 * the max number of options per group. Use with modest input sizes.
 */
export function generateBestCombinations(
  candidates: Course[],
  maxCombinations = 50,
): ScheduleCombination[] {
  // Group courses by courseId (logical group)
  const groupsMap = new Map<string, Course[]>();
  for (const c of candidates) {
    const key = c.courseId || c.id;
    const list = groupsMap.get(key);
    if (list) list.push(c);
    else groupsMap.set(key, [c]);
  }

  const groups = Array.from(groupsMap.values());
  const results: ScheduleCombination[] = [];

  function backtrack(groupIndex: number, current: Course[]) {
    if (results.length >= maxCombinations) return;

    if (groupIndex >= groups.length) {
      if (current.length === 0) return;
      const totalUnits = current.reduce((sum, c) => sum + c.credits, 0);
      const daysUsed = calculateDaysUsed(current);
      const emptyHours = calculateEmptyHours(current);
      const score = daysUsed + 0.5 * emptyHours;
      results.push({ courses: current.slice(), totalUnits, daysUsed, emptyHours, score });
      return;
    }

    // Option 1: skip this group
    backtrack(groupIndex + 1, current);

    // Option 2: try each course in this group
    const group = groups[groupIndex];
    for (const option of group) {
      // Check conflicts against current schedule
      const conflict = courseHasConflict(current, option);
      if (conflict.hasConflict) continue;

      current.push(option);
      backtrack(groupIndex + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);

  // Sort combinations by quality: fewer days, less empty time, more units
  results.sort((a, b) => {
    if (a.daysUsed !== b.daysUsed) return a.daysUsed - b.daysUsed;
    if (a.emptyHours !== b.emptyHours) return a.emptyHours - b.emptyHours;
    return b.totalUnits - a.totalUnits;
  });

  return results;
}