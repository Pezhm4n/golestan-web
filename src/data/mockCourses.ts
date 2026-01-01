import { Course } from '@/types/course';

export const departments = [
  { id: '1', name: 'مهندسی کامپیوتر' },
  { id: '2', name: 'مهندسی برق' },
  { id: '3', name: 'مهندسی مکانیک' },
  { id: '4', name: 'علوم پایه' },
  { id: 'custom', name: 'دروس اضافه شده من' },
];

export const availableCourses: Course[] = [
  {
    id: '1',
    courseId: '۴۰۱۲۱۵۰۱',
    name: 'ریاضی عمومی ۱',
    instructor: 'دکتر احمدی',
    credits: 3,
    examDate: '۱۴۰۳/۰۴/۱۵',
    examTime: '۰۸:۰۰',
    description: 'مباحث پایه ریاضیات شامل حد، مشتق و انتگرال',
    gender: 'mixed',
    capacity: 40,
    enrolled: 35,
    type: 'theoretical',
    isGeneral: false,
    category: 'available',
    departmentId: '1',
    group: 'basic', // پایه
    sessions: [
      { day: 0, startTime: 8, endTime: 10, location: 'کلاس ۱۰۱', weekType: 'both' },
      { day: 2, startTime: 8, endTime: 10, location: 'کلاس ۱۰۱', weekType: 'both' },
    ]
  },
  {
    id: '2',
    courseId: '۴۰۱۲۱۵۰۲',
    name: 'فیزیک ۲',
    instructor: 'دکتر محمدی',
    credits: 3,
    examDate: '۱۴۰۳/۰۴/۱۸',
    examTime: '۱۰:۰۰',
    description: 'الکتریسیته و مغناطیس',
    gender: 'mixed',
    capacity: 35,
    enrolled: 35,
    type: 'both',
    isGeneral: false,
    category: 'available',
    departmentId: '2',
    group: 'basic', // پایه
    sessions: [
      { day: 1, startTime: 14, endTime: 16, location: 'آزمایشگاه ۳', weekType: 'both' },
    ]
  },
  {
    id: '3',
    courseId: '۴۰۱۳۱۵۰۱',
    name: 'اندیشه اسلامی',
    instructor: 'استاد حسینی',
    credits: 2,
    examDate: '۱۴۰۳/۰۴/۲۰',
    examTime: '۱۴:۰۰',
    description: 'مباحث اعتقادی و فکری اسلام',
    gender: 'male',
    capacity: 50,
    enrolled: 30,
    type: 'theoretical',
    isGeneral: true,
    category: 'available',
    departmentId: '4',
    group: 'general', // عمومی
    sessions: [
      { day: 3, startTime: 10, endTime: 12, location: 'سالن ۱', weekType: 'odd' },
    ]
  },
  {
    id: '4',
    courseId: '۴۰۱۲۱۵۰۳',
    name: 'برنامه‌سازی پیشرفته',
    instructor: 'دکتر رضایی',
    credits: 3,
    examDate: '۱۴۰۳/۰۴/۲۲',
    examTime: '۰۸:۰۰',
    description: 'ساختمان داده و الگوریتم‌های پیشرفته',
    gender: 'mixed',
    capacity: 30,
    enrolled: 28,
    type: 'both',
    isGeneral: false,
    category: 'available',
    departmentId: '1',
    group: 'specialized', // تخصصی
    sessions: [
      { day: 0, startTime: 10, endTime: 12, location: 'کلاس ۲۰۵', weekType: 'both' },
      { day: 4, startTime: 14, endTime: 16, location: 'لابراتوار ۱', weekType: 'both' },
    ]
  },
  {
    id: '5',
    courseId: '۴۰۱۳۱۵۰۲',
    name: 'زبان انگلیسی',
    instructor: 'استاد کریمی',
    credits: 2,
    examDate: '۱۴۰۳/۰۴/۲۵',
    examTime: '۱۰:۰۰',
    description: 'مهارت‌های خواندن و نوشتن انگلیسی',
    gender: 'female',
    capacity: 25,
    enrolled: 20,
    type: 'theoretical',
    isGeneral: true,
    category: 'available',
    departmentId: '4',
    group: 'general', // عمومی
    sessions: [
      { day: 3, startTime: 10, endTime: 12, location: 'کلاس ۳۰۱', weekType: 'even' },
    ]
  },
  {
    id: '6',
    courseId: '۴۰۱۲۱۵۰۴',
    name: 'مدارهای الکتریکی',
    instructor: 'دکتر علوی',
    credits: 3,
    examDate: '۱۴۰۳/۰۴/۲۸',
    examTime: '۱۴:۰۰',
    description: 'تحلیل مدارهای الکتریکی DC و AC',
    gender: 'mixed',
    capacity: 35,
    enrolled: 32,
    type: 'practical',
    isGeneral: false,
    category: 'other',
    departmentId: '2',
    group: 'specialized', // تخصصی
    sessions: [
      { day: 4, startTime: 10, endTime: 12, location: 'آزمایشگاه ۵', weekType: 'both' },
    ]
  },
  {
    id: '7',
    courseId: '۴۰۱۲۱۵۰۵',
    name: 'آمار و احتمال',
    instructor: 'دکتر نوری',
    credits: 3,
    examDate: '۱۴۰۳/۰۴/۱۶',
    examTime: '۱۶:۰۰',
    description: 'مبانی آمار توصیفی و استنباطی',
    gender: 'mixed',
    capacity: 40,
    enrolled: 38,
    type: 'theoretical',
    isGeneral: false,
    category: 'other',
    departmentId: '4',
    group: 'basic', // پایه
    sessions: [
      { day: 2, startTime: 10, endTime: 12, location: 'کلاس ۱۰۲', weekType: 'both' },
    ]
  },
  {
    id: '8',
    courseId: '۴۰۱۲۱۵۰۶',
    name: 'کارگاه عمومی',
    instructor: 'مهندس صالحی',
    credits: 1,
    examDate: '۱۴۰۳/۰۴/۳۰',
    examTime: '۰۸:۰۰',
    description: 'آشنایی با ابزارهای کارگاهی',
    gender: 'male',
    capacity: 20,
    enrolled: 20,
    type: 'practical',
    isGeneral: false,
    category: 'other',
    departmentId: '3',
    group: 'general', // عمومی
    sessions: [
      { day: 5, startTime: 8, endTime: 10, location: 'کارگاه ۲', weekType: 'both' },
    ]
  },
  {
    id: '9',
    courseId: '۴۰۱۲۱۵۰۷',
    name: 'معادلات دیفرانسیل',
    instructor: 'دکتر کاظمی',
    credits: 3,
    examDate: '۱۴۰۳/۰۴/۱۷',
    examTime: '۱۰:۰۰',
    description: 'حل معادلات دیفرانسیل معمولی',
    gender: 'mixed',
    capacity: 35,
    enrolled: 30,
    type: 'theoretical',
    isGeneral: false,
    category: 'available',
    departmentId: '1',
    group: 'basic', // پایه
    sessions: [
      { day: 1, startTime: 8, endTime: 10, location: 'کلاس ۲۰۱', weekType: 'both' },
      { day: 3, startTime: 8, endTime: 10, location: 'کلاس ۲۰۱', weekType: 'both' },
    ]
  },
  {
    id: '10',
    courseId: '۴۰۱۳۱۵۰۳',
    name: 'تربیت بدنی',
    instructor: 'استاد مرادی',
    credits: 1,
    examDate: '',
    examTime: '',
    description: 'ورزش و تندرستی',
    gender: 'male',
    capacity: 30,
    enrolled: 25,
    type: 'practical',
    isGeneral: true,
    category: 'other',
    departmentId: '4',
    group: 'general', // عمومی
    sessions: [
      { day: 5, startTime: 10, endTime: 12, location: 'سالن ورزشی', weekType: 'both' },
    ]
  },
  // درس‌های با تداخل زمانی برای تست
  {
    id: '11',
    courseId: '۴۰۱۲۱۵۰۸',
    name: 'ساختمان داده',
    instructor: 'دکتر موسوی',
    credits: 3,
    examDate: '۱۴۰۳/۰۴/۲۳',
    examTime: '۰۸:۰۰',
    description: 'آرایه، لیست پیوندی، درخت و گراف',
    gender: 'mixed',
    capacity: 35,
    enrolled: 30,
    type: 'both',
    isGeneral: false,
    category: 'available',
    departmentId: '1',
    group: 'specialized',
    sessions: [
      { day: 0, startTime: 8, endTime: 10, location: 'کلاس ۳۰۲', weekType: 'both' }, // تداخل با ریاضی عمومی
    ]
  },
  {
    id: '12',
    courseId: '۴۰۱۲۱۵۰۹',
    name: 'الگوریتم',
    instructor: 'دکتر حسینی',
    credits: 3,
    examDate: '۱۴۰۳/۰۴/۲۴',
    examTime: '۱۰:۰۰',
    description: 'طراحی و تحلیل الگوریتم‌ها',
    gender: 'mixed',
    capacity: 30,
    enrolled: 28,
    type: 'theoretical',
    isGeneral: false,
    category: 'available',
    departmentId: '1',
    group: 'specialized',
    sessions: [
      { day: 0, startTime: 8, endTime: 10, location: 'کلاس ۴۰۱', weekType: 'both' }, // تداخل با ریاضی و ساختمان داده
    ]
  },
  {
    id: '13',
    courseId: '۴۰۱۲۱۵۱۰',
    name: 'شبکه‌های کامپیوتری',
    instructor: 'دکتر کریمی',
    credits: 3,
    examDate: '۱۴۰۳/۰۴/۲۶',
    examTime: '۱۴:۰۰',
    description: 'مبانی شبکه و پروتکل‌ها',
    gender: 'mixed',
    capacity: 35,
    enrolled: 32,
    type: 'both',
    isGeneral: false,
    category: 'available',
    departmentId: '1',
    group: 'specialized',
    sessions: [
      { day: 0, startTime: 10, endTime: 12, location: 'کلاس ۲۰۶', weekType: 'both' }, // تداخل با برنامه‌سازی پیشرفته
    ]
  }
];
