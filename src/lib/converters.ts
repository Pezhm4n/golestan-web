import type { Course, CourseSession, CourseGroup, CourseType, Gender } from '@/types/course';
import type { GolestanCourse, GolestanTimeSlot } from '@/types/golestan';
import {
  golestanTimeSlotToNormalizedSession,
  parseExamTime,
} from '@/lib/utils/golestan';
import { normalizeText } from '@/lib/textNormalizer';

/**
 * Map raw gender string from Golestan to internal Gender enum.
 * Falls back to 'mixed' when uncertain.
 */
function mapGender(raw: string | undefined | null): Gender {
  if (!raw) return 'mixed';
  const norm = normalizeText(raw);

  // Very simple heuristics; can be refined as we observe real values
  if (
    norm.includes('مرد') ||
    norm.includes('پسر') ||
    norm.includes('برادر') ||
    norm.includes('اقا') ||
    norm.includes('آقا')
  ) {
    return 'male';
  }

  if (
    norm.includes('زن') ||
    norm.includes('دختر') ||
    norm.includes('خواهر') ||
    norm.includes('خانم')
  ) {
    return 'female';
  }

  return 'mixed';
}

/**
 * Map course type from name/description heuristics.
 * Default is 'theoretical'.
 */
function mapCourseType(name: string, description?: string): CourseType {
  const normName = normalizeText(name);
  const normDesc = normalizeText(description || '');

  const text = `${normName} ${normDesc}`;

  const hasLab =
    text.includes('ازمايشگاه') || text.includes('کارگاه') || text.includes('کاراموزي');

  const hasPractical =
    text.includes('عملي') || text.includes('عملی');

  const hasTheoretical =
    text.includes('نظري') || text.includes('نظری');

  if ((hasLab || hasPractical) && hasTheoretical) {
    return 'both';
  }
  if (hasLab || hasPractical) {
    return 'practical';
  }
  return 'theoretical';
}

/**
 * Map course group (basic / general / specialized) based on name/faculty.
 * Default is 'specialized'.
 */
function mapCourseGroup(course: GolestanCourse): CourseGroup {
  const nameNorm = normalizeText(course.name);
  const facultyNorm = normalizeText(course.faculty || '');

  // General education (عمومی)
  const generalKeywords = [
    'عمومي',
    'عمومی',
    'معارف',
    'اندیشه',
    'انديشه',
    'تربيت بدني',
    'تربیت بدنی',
    'فارسي عمومي',
    'فارسی عمومی',
    'انسانی',
    'انسانشناسي',
  ];
  if (generalKeywords.some(k => nameNorm.includes(normalizeText(k)))) {
    return 'general';
  }

  // Basic courses (ریاضی، فیزیک، شیمی، زبان عمومی، etc.)
  const basicKeywords = [
    'رياضي',
    'ریاضی',
    'فيزيک',
    'فیزیک',
    'شيمي',
    'شیمی',
    'امار',
    'آمار',
    'زبان عمومي',
    'زبان عمومی',
  ];
  if (basicKeywords.some(k => nameNorm.includes(normalizeText(k)))) {
    return 'basic';
  }

  // Fall back to faculty-based hints if needed (optional)
  if (facultyNorm.includes('علوم پايه') || facultyNorm.includes('علوم پایه')) {
    return 'basic';
  }

  return 'specialized';
}

/**
 * Convert minutes since midnight to "HH:MM" format.
 */
function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Convert a GolestanTimeSlot to a UI CourseSession using existing normalization.
 */
function convertTimeSlotToSession(slot: GolestanTimeSlot): CourseSession | null {
  const normalized = golestanTimeSlotToNormalizedSession(slot);
  if (!normalized) return null;

  return {
    day: normalized.dayIndex,
    startTime: normalized.startHour,
    endTime: normalized.endHour,
    location: normalized.location,
    weekType: normalized.weekType,
  };
}

/**
 * Convert a single GolestanCourse (raw API model) into the app's Course model.
 *
 * faculty/department are passed explicitly so we can build a stable
 * composite departmentId used by the filtering UI.
 *
 * NOTE: This does not attempt to deduplicate sections by code; each
 * GolestanCourse is mapped to a single Course with id == courseId.
 */
export function convertGolestanCourseToAppCourse(
  gCourse: GolestanCourse,
  faculty?: string,
  department?: string,
): Course {
  // Sessions
  const sessions: CourseSession[] = [];
  for (const slot of gCourse.schedule || []) {
    const session = convertTimeSlotToSession(slot);
    if (session) {
      sessions.push(session);
    }
  }

  // Exam date/time
  let examDate: string | undefined;
  let examTime: string | undefined;

  if (gCourse.exam_time) {
    const parsed = parseExamTime(gCourse.exam_time);
    if (parsed) {
      examDate = parsed.date;
      examTime = `${minutesToTimeString(parsed.start)}-${minutesToTimeString(parsed.end)}`;
    }
  }

  const capacity = Number.parseInt(gCourse.capacity, 10);
  const safeCapacity = Number.isFinite(capacity) ? capacity : 0;

  const gender = mapGender(gCourse.gender);
  const group = mapCourseGroup(gCourse);
  const type = mapCourseType(gCourse.name, gCourse.description);

  const facultyName = faculty ?? gCourse.faculty ?? '';
  const deptName = department ?? gCourse.department ?? '';

  const departmentId =
    facultyName && deptName
      ? `${facultyName}:::${deptName}`
      : deptName || facultyName || 'unknown';

  // Parse course code and group number from patterns like "1624872_37"
  const rawCode = gCourse.code || '';
  const [baseCode, groupPart] = rawCode.split('_');
  const normalizedCourseId = baseCode || rawCode;

  const parsedGroup =
    groupPart && groupPart.trim() !== ''
      ? Number.parseInt(groupPart, 10)
      : 1;
  const safeGroupNumber = Number.isFinite(parsedGroup) ? parsedGroup : 1;

  return {
    // Use full raw code as unique identifier for this specific section/group
    id: rawCode,
    // Use base code (before the underscore) as logical courseId
    courseId: normalizedCourseId,
    name: gCourse.name,
    instructor: gCourse.instructor || '',
    credits: gCourse.credits || 0,
    examDate,
    examTime,
    description: gCourse.description || '',
    gender,
    capacity: safeCapacity,
    enrolled: 0,                   // API does not currently expose enrolled count
    type,
    isGeneral: group === 'general',
    category: gCourse.is_available ? 'available' : 'other',
    departmentId,
    sessions,
    group,
    groupNumber: safeGroupNumber,
  };
}