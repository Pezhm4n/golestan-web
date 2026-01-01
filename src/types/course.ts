export type WeekType = 'odd' | 'even' | 'both';
export type Gender = 'male' | 'female' | 'mixed';
export type CourseType = 'theoretical' | 'practical' | 'both';

export interface Course {
  id: string;
  courseId: string; // کد درس
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
  isGeneral: boolean; // دروس عمومی
}

export interface ScheduledCourse extends Course {
  day: number; // 0 = Saturday, 5 = Thursday
  startTime: number; // 7-19 (hour)
  endTime: number; // 8-20 (hour)
  location: string;
  weekType: WeekType; // odd = فرد, even = زوج, both = هر هفته
}

export const DAYS = [
  'شنبه',
  'یک‌شنبه', 
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه'
] as const;

export const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => 7 + i); // 7:00 to 20:00
