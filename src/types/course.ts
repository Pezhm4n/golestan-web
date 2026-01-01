export type WeekType = 'odd' | 'even' | 'both';
export type Gender = 'male' | 'female' | 'mixed';
export type CourseType = 'theoretical' | 'practical' | 'both';
export type CourseCategory = 'available' | 'other';

export interface CourseSession {
  day: number; // 0 = Saturday, 5 = Thursday
  startTime: number; // 7-19 (hour)
  endTime: number; // 8-20 (hour)
  location: string;
  weekType: WeekType;
}

export interface Course {
  id: string;
  courseId: string;
  name: string;
  instructor: string;
  credits: number;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'teal';
  examDate?: string;
  examTime?: string;
  description?: string;
  gender: Gender;
  capacity: number;
  enrolled: number;
  type: CourseType;
  isGeneral: boolean;
  category: CourseCategory; // 'available' = allowed to take, 'other' = not allowed
  sessions: CourseSession[]; // Multi-session support
}

// For grid rendering - a flattened session with course info
export interface ScheduledSession extends CourseSession {
  courseId: string; // Reference to parent course
  courseName: string;
  instructor: string;
  credits: number;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'teal';
  examDate?: string;
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