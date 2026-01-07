export type WeekType = 'odd' | 'even' | 'both';
export type Gender = 'male' | 'female' | 'mixed';
export type CourseType = 'theoretical' | 'practical' | 'both';
export type CourseCategory = 'available' | 'other';
export type CourseGroup = 'specialized' | 'general' | 'basic'; // تخصصی، عمومی، پایه

export interface CourseSession {
  day: number; // 0 = Saturday, 5 = Thursday
  /**
   * Start time of the session.
   * Can be stored as an hour (e.g. 8, 9.5) or as a string \"HH:MM\".
   */
  startTime: number | string;
  /**
   * End time of the session.
   * Can be stored as an hour (e.g. 10, 11.5) or as a string \"HH:MM\".
   */
  endTime: number | string;
  location: string;
  weekType: WeekType;
}

export interface Course {
  id: string;
  courseId: string;
  name: string;
  instructor: string;
  credits: number;
  examDate?: string;
  examTime?: string;
  description?: string;
  gender: Gender;
  capacity: number;
  enrolled: number;
  type: CourseType;
  isGeneral: boolean;
  category: CourseCategory; // 'available' = allowed to take, 'other' = not allowed
  departmentId?: string; // Department this course belongs to
  sessions: CourseSession[]; // Multi-session support
  group: CourseGroup; // نوع درس برای رنگ‌بندی
  groupNumber?: number; // شماره گروه (مثلاً گروه ۱، ۲، ۳)
}

// For grid rendering - a flattened session with course info
export interface ScheduledSession extends CourseSession {
  courseId: string; // Reference to parent course
  parentId: string; // Parent course ID for color generation
  courseName: string;
  instructor: string;
  credits: number;
  group: CourseGroup;
  groupNumber?: number; // شماره گروه
  examDate?: string;
  examTime?: string;
  /** Optional course description propagated from the parent Course. */
  description?: string;

  /**
   * Optional metadata used by the grid to render complex time conflicts.
   * When absent, CourseCell falls back to the legacy stacking behaviour.
   */
  conflictMetadata?: {
    /** Real duration of this session in minutes (end - start). */
    durationMinutes: number;
    /** True when this session is part of a conflict group with mixed durations. */
    hasMixedDurationConflict: boolean;
    /** Display order inside the conflict stack (0 = first/shortest). */
    conflictDisplayOrder?: number;
    /** Total number of sessions in this conflicted group. */
    totalConflicts?: number;
  };
}

export const DAYS = [
  'شنبه',
  'یک‌شنبه', 
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه'
] as const;

export const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => 7 + i);