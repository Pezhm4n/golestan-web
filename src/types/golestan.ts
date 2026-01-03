import type { WeekType, Gender, CourseGroup } from './course';

export type FacultyName = string;
export type DepartmentName = string;

/**
 * Raw time slot / schedule entry as returned by the Golestoon scraper.
 * Day is a Persian weekday name, times are 24h strings (HH:MM),
 * parity is typically '' (both), 'ف' (odd) or 'ز' (even).
 */
export interface GolestanTimeSlot {
  day: string;
  start: string;
  end: string;
  parity: string;
  location: string;
}

/**
 * Exam time is encoded in the backend as a single string, e.g.:
 * "1404/11/06 - 13:30-15:30"
 */
export type GolestanExamTimeString = string;

/**
 * Raw course object as returned by the Golestoon scraper API and used
 * in the legacy Python application.
 */
export interface GolestanCourse {
  code: string;
  name: string;
  credits: number;
  capacity: string;
  enrollment_conditions: string;
  exam_time: GolestanExamTimeString;
  is_available: boolean;
  updated_at?: string;
  instructor: string;
  gender: string;
  schedule: GolestanTimeSlot[];
  description?: string;
  department?: string;
  faculty?: string;
}

/**
 * Hierarchical response from /api/courses/all where courses are grouped
 * by faculty then department:
 *
 * {
 *   "Faculty A": {
 *     "Department X": [GolestanCourse, ...],
 *     "Department Y": [GolestanCourse, ...]
 *   },
 *   "Faculty B": { ... }
 * }
 */
export type GolestanCoursesByDepartment = Record<DepartmentName, GolestanCourse[]>;
export type GolestanCoursesResponse = Record<FacultyName, GolestanCoursesByDepartment>;

/**
 * Simplified structure for building faculty / department selectors.
 * Mirrors CourseDatabase.get_faculties_with_departments() in the
 * reference Python code.
 */
export type FacultiesWithDepartments = Record<FacultyName, DepartmentName[]>;

/**
 * Normalized session in UI coordinates, derived from GolestanTimeSlot and
 * mapped onto the grid used by CourseSession in course.ts.
 */
export interface NormalizedCourseSession {
  dayIndex: number; // 0–5 (Saturday–Thursday)
  startHour: number; // integer hour, e.g. 8 for 08:00
  endHour: number;
  location: string;
  weekType: WeekType;
}

/**
 * Bridging structure between a raw GolestanCourse and the UI Course type.
 * This is a suggested intermediate DTO for conversion logic.
 */
export interface GolestanCourseSection {
  id: string; // stable key, e.g. course code or course code + group
  courseId: string; // mirrors Course.courseId
  name: string;
  instructor: string;
  credits: number;
  gender: Gender | string;
  capacity: number | null;
  enrolled?: number | null;
  isAvailable: boolean;
  group: CourseGroup;
  groupNumber?: number;
  faculty?: string;
  department?: string;
  examDate?: string;
  examTime?: string;
  sessions: NormalizedCourseSession[];
}