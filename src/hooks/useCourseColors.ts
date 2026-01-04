import { useMemo } from 'react';
import { CourseGroup, Course } from '@/types/course';

// Base HSL color per course group (hue fixed per group)
const BASE_HSL: Record<CourseGroup, { h: number; s: number; l: number }> = {
  // تخصصی - آبی / بنفش
  specialized: { h: 210, s: 70, l: 75 },
  // عمومی - سبز / فیروزه‌ای
  general: { h: 160, s: 60, l: 74 },
  // پایه - نارنجی / گرم
  basic: { h: 25, s: 72, l: 74 },
};

function hashStringToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0; // 32-bit int
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Deterministic color generator:
 * - Keeps hue fixed per group (blueish / greenish / orangish)
 * - Varies saturation (±5%) and lightness (±10%) based on a hash of courseId
 */
export function getCourseColor(
  courseId: string,
  group: CourseGroup,
  _isDark?: boolean,
): string {
  const base = BASE_HSL[group];
  const hash = hashStringToInt(`${group}-${courseId}`);

  const satDelta = 5;
  const lightDelta = 10;

  // Saturation offset in [-5, +5]
  const satOffset = (hash % (satDelta * 2 + 1)) - satDelta;
  // Lightness offset in [-10, +10]
  const lightOffset =
    (Math.floor(hash / 31) % (lightDelta * 2 + 1)) - lightDelta;

  const s = clamp(base.s + satOffset, 35, 95);
  const l = clamp(base.l + lightOffset, 30, 90);

  return `hsl(${base.h} ${s}% ${l}%)`;
}

export function getCourseColorClass(courseId: string, group: CourseGroup): string {
  // This returns a unique identifier that can be used for dynamic styling
  return `course-${group}-${courseId}`;
}

// Reset color assignments (kept for API compatibility; no-op with hash-based colors)
export function resetColorAssignments() {
  // no state to reset in hash-based scheme
}

// Hook to get color for a course
export function useCourseColor(courseId: string, group: CourseGroup, isDark: boolean): string {
  return useMemo(() => {
    return getCourseColor(courseId, group, isDark);
  }, [courseId, group, isDark]);
}

// Hook to get colors for all selected courses
export function useCourseColors(courses: Course[], isDark: boolean): Map<string, string> {
  return useMemo(() => {
    const colorMap = new Map<string, string>();
    courses.forEach(course => {
      colorMap.set(course.id, getCourseColor(course.id, course.group, isDark));
    });
    return colorMap;
  }, [courses, isDark]);
}

export const GROUP_LABELS: Record<CourseGroup, string> = {
  specialized: 'تخصصی',
  general: 'عمومی',
  basic: 'پایه'
};
