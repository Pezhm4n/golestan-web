import { Course, ScheduledCourse } from '@/types/course';

export const availableCourses: Course[] = [
  {
    id: '1',
    name: 'ریاضی عمومی ۱',
    instructor: 'دکتر احمدی',
    credits: 3,
    color: 'blue',
    examDate: '۱۴۰۳/۰۴/۱۵',
    description: 'مباحث پایه ریاضیات شامل حد، مشتق و انتگرال'
  },
  {
    id: '2',
    name: 'فیزیک ۲',
    instructor: 'دکتر محمدی',
    credits: 3,
    color: 'green',
    examDate: '۱۴۰۳/۰۴/۱۸',
    description: 'الکتریسیته و مغناطیس'
  },
  {
    id: '3',
    name: 'اندیشه اسلامی',
    instructor: 'استاد حسینی',
    credits: 2,
    color: 'orange',
    examDate: '۱۴۰۳/۰۴/۲۰',
    description: 'مباحث اعتقادی و فکری اسلام'
  },
  {
    id: '4',
    name: 'برنامه‌سازی پیشرفته',
    instructor: 'دکتر رضایی',
    credits: 3,
    color: 'purple',
    examDate: '۱۴۰۳/۰۴/۲۲',
    description: 'ساختمان داده و الگوریتم‌های پیشرفته'
  },
  {
    id: '5',
    name: 'زبان انگلیسی',
    instructor: 'استاد کریمی',
    credits: 2,
    color: 'pink',
    examDate: '۱۴۰۳/۰۴/۲۵',
    description: 'مهارت‌های خواندن و نوشتن انگلیسی'
  },
  {
    id: '6',
    name: 'مدارهای الکتریکی',
    instructor: 'دکتر علوی',
    credits: 3,
    color: 'teal',
    examDate: '۱۴۰۳/۰۴/۲۸',
    description: 'تحلیل مدارهای الکتریکی DC و AC'
  }
];

export const scheduledCourses: ScheduledCourse[] = [
  // Saturday 08:00-10:00 - Dual course (Odd/Even)
  {
    id: '1',
    name: 'ریاضی عمومی ۱',
    instructor: 'دکتر احمدی',
    credits: 3,
    color: 'blue',
    day: 0,
    startTime: 8,
    endTime: 10,
    location: 'کلاس ۱۰۱',
    weekType: 'odd',
    examDate: '۱۴۰۳/۰۴/۱۵',
    description: 'مباحث پایه ریاضیات شامل حد، مشتق و انتگرال'
  },
  {
    id: '1b',
    name: 'آمار و احتمال',
    instructor: 'دکتر نوری',
    credits: 3,
    color: 'teal',
    day: 0,
    startTime: 8,
    endTime: 10,
    location: 'کلاس ۱۰۲',
    weekType: 'even',
    examDate: '۱۴۰۳/۰۴/۱۶',
    description: 'مبانی آمار توصیفی و استنباطی'
  },
  // Sunday 10:00-12:00 - Both weeks
  {
    id: '4',
    name: 'برنامه‌سازی پیشرفته',
    instructor: 'دکتر رضایی',
    credits: 3,
    color: 'purple',
    day: 1,
    startTime: 10,
    endTime: 12,
    location: 'کلاس ۲۰۵',
    weekType: 'both',
    examDate: '۱۴۰۳/۰۴/۲۲',
    description: 'ساختمان داده و الگوریتم‌های پیشرفته'
  },
  // Monday 14:00-16:00 - Both weeks
  {
    id: '2',
    name: 'فیزیک ۲',
    instructor: 'دکتر محمدی',
    credits: 3,
    color: 'green',
    day: 2,
    startTime: 14,
    endTime: 16,
    location: 'آزمایشگاه ۳',
    weekType: 'both',
    examDate: '۱۴۰۳/۰۴/۱۸',
    description: 'الکتریسیته و مغناطیس'
  },
  // Tuesday 08:00-10:00 - Dual course
  {
    id: '3',
    name: 'اندیشه اسلامی',
    instructor: 'استاد حسینی',
    credits: 2,
    color: 'orange',
    day: 3,
    startTime: 8,
    endTime: 10,
    location: 'سالن ۱',
    weekType: 'odd',
    examDate: '۱۴۰۳/۰۴/۲۰',
    description: 'مباحث اعتقادی و فکری اسلام'
  },
  {
    id: '5',
    name: 'زبان انگلیسی',
    instructor: 'استاد کریمی',
    credits: 2,
    color: 'pink',
    day: 3,
    startTime: 8,
    endTime: 10,
    location: 'کلاس ۳۰۱',
    weekType: 'even',
    examDate: '۱۴۰۳/۰۴/۲۵',
    description: 'مهارت‌های خواندن و نوشتن انگلیسی'
  },
  // Wednesday 10:00-12:00 - Single course both weeks
  {
    id: '6',
    name: 'مدارهای الکتریکی',
    instructor: 'دکتر علوی',
    credits: 3,
    color: 'teal',
    day: 4,
    startTime: 10,
    endTime: 12,
    location: 'آزمایشگاه ۵',
    weekType: 'both',
    examDate: '۱۴۰۳/۰۴/۲۸',
    description: 'تحلیل مدارهای الکتریکی DC و AC'
  },
  // Thursday 08:00-09:00 - Single hour course
  {
    id: '7',
    name: 'کارگاه عمومی',
    instructor: 'مهندس صالحی',
    credits: 1,
    color: 'blue',
    day: 5,
    startTime: 8,
    endTime: 9,
    location: 'کارگاه ۲',
    weekType: 'both',
    examDate: '۱۴۰۳/۰۴/۳۰',
    description: 'آشنایی با ابزارهای کارگاهی'
  }
];
