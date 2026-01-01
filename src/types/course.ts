export interface Course {
  id: string;
  name: string;
  instructor: string;
  credits: number;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'teal';
}

export interface ScheduledCourse extends Course {
  day: number; // 0 = Saturday, 5 = Thursday
  startTime: number; // 7-19 (hour)
  endTime: number; // 8-20 (hour)
  location: string;
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
