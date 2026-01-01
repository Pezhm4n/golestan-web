import { Course, ScheduledCourse } from '@/types/course';

export const availableCourses: Course[] = [
  {
    id: '1',
    name: 'ریاضی عمومی ۱',
    instructor: 'دکتر احمدی',
    credits: 3,
    color: 'blue'
  },
  {
    id: '2',
    name: 'فیزیک ۲',
    instructor: 'دکتر محمدی',
    credits: 3,
    color: 'green'
  },
  {
    id: '3',
    name: 'اندیشه اسلامی',
    instructor: 'استاد حسینی',
    credits: 2,
    color: 'orange'
  },
  {
    id: '4',
    name: 'برنامه‌سازی پیشرفته',
    instructor: 'دکتر رضایی',
    credits: 3,
    color: 'purple'
  },
  {
    id: '5',
    name: 'زبان انگلیسی',
    instructor: 'استاد کریمی',
    credits: 2,
    color: 'pink'
  },
  {
    id: '6',
    name: 'مدارهای الکتریکی',
    instructor: 'دکتر علوی',
    credits: 3,
    color: 'teal'
  }
];

export const scheduledCourses: ScheduledCourse[] = [
  {
    id: '1',
    name: 'ریاضی عمومی ۱',
    instructor: 'دکتر احمدی',
    credits: 3,
    color: 'blue',
    day: 0, // Saturday
    startTime: 8,
    endTime: 10,
    location: 'کلاس ۱۰۱'
  },
  {
    id: '4',
    name: 'برنامه‌سازی پیشرفته',
    instructor: 'دکتر رضایی',
    credits: 3,
    color: 'purple',
    day: 1, // Sunday
    startTime: 10,
    endTime: 12,
    location: 'کلاس ۲۰۵'
  },
  {
    id: '2',
    name: 'فیزیک ۲',
    instructor: 'دکتر محمدی',
    credits: 3,
    color: 'green',
    day: 2, // Monday
    startTime: 14,
    endTime: 16,
    location: 'آزمایشگاه ۳'
  },
  {
    id: '3',
    name: 'اندیشه اسلامی',
    instructor: 'استاد حسینی',
    credits: 2,
    color: 'orange',
    day: 3, // Tuesday
    startTime: 8,
    endTime: 10,
    location: 'سالن ۱'
  }
];
