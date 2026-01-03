import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Course, ScheduledSession } from '@/types/course';
import { toast } from 'sonner';
import { hasConflict as schedulerHasConflict } from '@/lib/scheduler';
import { useGolestanData } from '@/hooks/useGolestanData';
import { convertGolestanCourseToAppCourse } from '@/lib/converters';

interface ScheduleContextType {
  // State
  selectedCourseIds: string[];
  hoveredCourseId: string | null;
  customCourses: Course[];
  
  // Derived
  selectedCourses: Course[];
  scheduledSessions: ScheduledSession[];
  totalUnits: number;
  allCourses: Course[];
  
  // Actions
  addCourse: (course: Course) => boolean;
  removeCourse: (courseId: string) => void;
  clearAll: () => void;
  toggleCourse: (course: Course) => void;
  setHoveredCourseId: (id: string | null) => void;
  addCustomCourse: (course: Course) => void;
  removeCustomCourse: (courseId: string) => void;
  
  // Helpers
  isCourseSelected: (courseId: string) => boolean;
  hasConflict: (course: Course) => { hasConflict: boolean; conflictWith?: string; reason?: string };
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
  const [customCourses, setCustomCourses] = useState<Course[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('golestan-custom-courses');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as Course[];
    } catch {
      return [];
    }
  });
  const { flattenedCourses } = useGolestanData();

  // Persist custom courses to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('golestan-custom-courses', JSON.stringify(customCourses));
    } catch {
      // ignore storage errors
    }
  }, [customCourses]);

  // Convert raw Golestan courses to app Course model
  const apiCourses: Course[] = useMemo(() => {
    if (!flattenedCourses || flattenedCourses.length === 0) return [];
    // NOTE: For ~3000+ courses this conversion runs once per data load thanks to useMemo.
    return flattenedCourses.map(({ course, faculty, department }) =>
      convertGolestanCourseToAppCourse(course, faculty, department),
    );
  }, [flattenedCourses]);

  // All available courses (custom first, then API)
  const allCourses = useMemo(() => {
    return [...customCourses, ...apiCourses];
  }, [apiCourses, customCourses]);

  // Get selected courses
  const selectedCourses = useMemo(() => {
    return allCourses.filter(c => selectedCourseIds.includes(c.id));
  }, [selectedCourseIds, allCourses]);

  // Flatten sessions for grid rendering
  const scheduledSessions = useMemo((): ScheduledSession[] => {
    return selectedCourses.flatMap(course => 
      course.sessions.map(session => ({
        ...session,
        courseId: course.courseId,
        parentId: course.id,
        courseName: course.name,
        instructor: course.instructor,
        credits: course.credits,
        group: course.group,
        groupNumber: course.groupNumber,
        examDate: course.examDate,
        examTime: course.examTime,
      }))
    );
  }, [selectedCourses]);

  // Total units
  const totalUnits = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [selectedCourses]);

  // Check if a course is selected
  const isCourseSelected = useCallback((courseId: string) => {
    return selectedCourseIds.includes(courseId);
  }, [selectedCourseIds]);

  // Check for conflicts with a new course using core scheduler logic
  const hasConflict = useCallback((course: Course): { hasConflict: boolean; conflictWith?: string; reason?: string } => {
    return schedulerHasConflict(selectedCourses, course);
  }, [selectedCourses]);

  // Add course - allow conflicts but warn
  const addCourse = useCallback((course: Course): boolean => {
    if (selectedCourseIds.includes(course.id)) return false;
    
    const conflict = hasConflict(course);
    
    setSelectedCourseIds(prev => [...prev, course.id]);
    
    if (conflict.hasConflict) {
      const reasonLabel =
        conflict.reason === 'exam'
          ? 'تداخل امتحان'
          : 'تداخل زمانی';
      toast.warning(reasonLabel + '!', {
        description: conflict.conflictWith
          ? `این درس با «${conflict.conflictWith}» ${reasonLabel.toLowerCase()} دارد. می‌تونی یکی رو حذف کنی.`
          : 'این درس با یکی از درس‌های انتخاب‌شده تداخل دارد.',
        duration: 4000,
      });
    } else {
      toast.success('درس اضافه شد', {
        description: course.name,
        duration: 2000,
      });
    }
    return true;
  }, [selectedCourseIds, hasConflict]);

  // Remove course
  const removeCourse = useCallback((courseId: string) => {
    const course = allCourses.find(c => c.id === courseId);
    setSelectedCourseIds(prev => prev.filter(id => id !== courseId));
    // Clear any hover/preview state so ghost previews disappear immediately
    setHoveredCourseId(null);
    if (course) {
      toast.info('درس حذف شد', {
        description: course.name,
        duration: 2000,
      });
    }
  }, [allCourses]);

  // Clear all courses
  const clearAll = useCallback(() => {
    setSelectedCourseIds([]);
    setHoveredCourseId(null);
  }, []);

  // Toggle course (add/remove)
  const toggleCourse = useCallback((course: Course) => {
    if (selectedCourseIds.includes(course.id)) {
      removeCourse(course.id);
    } else {
      addCourse(course);
    }
  }, [selectedCourseIds, addCourse, removeCourse]);

  // Add a custom course
  const addCustomCourse = useCallback((course: Course) => {
    setCustomCourses(prev => [...prev, course]);
  }, []);

  // Permanently remove a custom course (and unselect it if needed)
  const removeCustomCourse = useCallback((courseId: string) => {
    setCustomCourses(prev => prev.filter(c => c.id !== courseId));
    setSelectedCourseIds(prev => prev.filter(id => id !== courseId));
    // Clear hover/preview for this course if it was active
    setHoveredCourseId(prev => (prev === courseId ? null : prev));
  }, []);

  const value: ScheduleContextType = {
    selectedCourseIds,
    hoveredCourseId,
    customCourses,
    selectedCourses,
    scheduledSessions,
    totalUnits,
    allCourses,
    addCourse,
    removeCourse,
    clearAll,
    toggleCourse,
    setHoveredCourseId,
    addCustomCourse,
    removeCustomCourse,
    isCourseSelected,
    hasConflict,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
