import { useMemo } from 'react';
import { CourseGroup, Course } from '@/types/course';

// Color families for each course group
// Each family has different hues that are visually similar but distinguishable
const COLOR_FAMILIES = {
  // تخصصی - آبی و بنفش (رنگ‌های سرد)
  specialized: {
    light: [
      { h: 210, s: 75, l: 82 }, // آبی روشن
      { h: 225, s: 70, l: 80 }, // آبی متمایل به بنفش
      { h: 240, s: 65, l: 82 }, // بنفش کمرنگ
      { h: 200, s: 70, l: 78 }, // آبی فیروزه‌ای
      { h: 255, s: 60, l: 83 }, // بنفش روشن
      { h: 195, s: 72, l: 80 }, // آبی آسمانی
    ],
    dark: [
      { h: 210, s: 55, l: 38 },
      { h: 225, s: 50, l: 36 },
      { h: 240, s: 45, l: 38 },
      { h: 200, s: 50, l: 34 },
      { h: 255, s: 40, l: 39 },
      { h: 195, s: 52, l: 36 },
    ]
  },
  // عمومی - سبز و فیروزه‌ای (طبیعت)
  general: {
    light: [
      { h: 150, s: 55, l: 80 }, // سبز نعنایی
      { h: 165, s: 50, l: 78 }, // سبز فیروزه‌ای
      { h: 135, s: 48, l: 82 }, // سبز کمرنگ
      { h: 175, s: 52, l: 79 }, // فیروزه‌ای
      { h: 120, s: 42, l: 83 }, // سبز چمنی روشن
      { h: 158, s: 58, l: 77 }, // سبز زمردی
    ],
    dark: [
      { h: 150, s: 40, l: 32 },
      { h: 165, s: 38, l: 30 },
      { h: 135, s: 35, l: 34 },
      { h: 175, s: 38, l: 31 },
      { h: 120, s: 32, l: 35 },
      { h: 158, s: 42, l: 30 },
    ]
  },
  // پایه - نارنجی و صورتی (رنگ‌های گرم)
  basic: {
    light: [
      { h: 25, s: 75, l: 82 },  // نارنجی پرتقالی
      { h: 35, s: 70, l: 80 },  // نارنجی طلایی
      { h: 10, s: 72, l: 83 },  // قرمز گلبهی
      { h: 340, s: 65, l: 82 }, // صورتی
      { h: 45, s: 68, l: 79 },  // زرد طلایی
      { h: 355, s: 70, l: 84 }, // صورتی قرمز
    ],
    dark: [
      { h: 25, s: 55, l: 36 },
      { h: 35, s: 50, l: 34 },
      { h: 10, s: 52, l: 38 },
      { h: 340, s: 45, l: 36 },
      { h: 45, s: 48, l: 33 },
      { h: 355, s: 50, l: 38 },
    ]
  }
};

// Track used colors per group to ensure uniqueness
const usedColorsPerGroup: Record<CourseGroup, Set<number>> = {
  specialized: new Set(),
  general: new Set(),
  basic: new Set()
};

// Map to store course-to-color assignments
const courseColorMap = new Map<string, { index: number; group: CourseGroup }>();

export function getCourseColor(courseId: string, group: CourseGroup, isDark: boolean): string {
  // Check if this course already has a color assigned
  let assignment = courseColorMap.get(courseId);
  
  if (!assignment) {
    // Find the next available color in this group
    const usedColors = usedColorsPerGroup[group];
    const maxColors = COLOR_FAMILIES[group].light.length;
    
    let colorIndex = 0;
    for (let i = 0; i < maxColors; i++) {
      if (!usedColors.has(i)) {
        colorIndex = i;
        break;
      }
    }
    
    // If all colors are used, start over with variation
    if (usedColors.size >= maxColors) {
      colorIndex = usedColors.size % maxColors;
    }
    
    usedColors.add(colorIndex);
    assignment = { index: colorIndex, group };
    courseColorMap.set(courseId, assignment);
  }
  
  const colors = isDark ? COLOR_FAMILIES[group].dark : COLOR_FAMILIES[group].light;
  const color = colors[assignment.index % colors.length];
  
  return `hsl(${color.h} ${color.s}% ${color.l}%)`;
}

export function getCourseColorClass(courseId: string, group: CourseGroup): string {
  // This returns a unique identifier that can be used for dynamic styling
  return `course-${group}-${courseId}`;
}

// Reset color assignments (useful for testing or when courses change significantly)
export function resetColorAssignments() {
  usedColorsPerGroup.specialized.clear();
  usedColorsPerGroup.general.clear();
  usedColorsPerGroup.basic.clear();
  courseColorMap.clear();
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
