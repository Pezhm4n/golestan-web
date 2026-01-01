import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Course, ScheduledSession, WeekType } from '@/types/course';
import { availableCourses } from '@/data/mockCourses';
import { toast } from 'sonner';

interface ScheduleContextType {
  // State
  selectedCourseIds: string[];
  hoveredCourseId: string | null;
  
  // Derived
  selectedCourses: Course[];
  scheduledSessions: ScheduledSession[];
  totalUnits: number;
  
  // Actions
  addCourse: (course: Course) => boolean;
  removeCourse: (courseId: string) => void;
  clearAll: () => void;
  toggleCourse: (course: Course) => void;
  setHoveredCourseId: (id: string | null) => void;
  
  // Helpers
  isCourseSelected: (courseId: string) => boolean;
  hasConflict: (course: Course) => { hasConflict: boolean; conflictWith?: string };
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Check if two time ranges overlap
const timeRangesOverlap = (
  start1: number, end1: number, 
  start2: number, end2: number
): boolean => {
  return start1 < end2 && start2 < end1;
};

// Check if two week types can coexist
const weekTypesConflict = (type1: WeekType, type2: WeekType): boolean => {
  if (type1 === 'both' || type2 === 'both') return true;
  return type1 === type2;
};

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(['1', '4']); // Pre-select some
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);

  // Get selected courses
  const selectedCourses = useMemo(() => {
    return availableCourses.filter(c => selectedCourseIds.includes(c.id));
  }, [selectedCourseIds]);

  // Flatten sessions for grid rendering
  const scheduledSessions = useMemo((): ScheduledSession[] => {
    return selectedCourses.flatMap(course => 
      course.sessions.map(session => ({
        ...session,
        courseId: course.id,
        courseName: course.name,
        instructor: course.instructor,
        credits: course.credits,
        color: course.color,
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

  // Check for conflicts with a new course
  const hasConflict = useCallback((course: Course): { hasConflict: boolean; conflictWith?: string } => {
    for (const newSession of course.sessions) {
      for (const existingSession of scheduledSessions) {
        // Skip if different day
        if (newSession.day !== existingSession.day) continue;
        
        // Check time overlap
        if (!timeRangesOverlap(
          newSession.startTime, newSession.endTime,
          existingSession.startTime, existingSession.endTime
        )) continue;

        // Check week type conflict
        if (weekTypesConflict(newSession.weekType, existingSession.weekType)) {
          const conflictCourse = availableCourses.find(c => c.id === existingSession.courseId);
          return { hasConflict: true, conflictWith: conflictCourse?.name };
        }
      }
    }
    return { hasConflict: false };
  }, [scheduledSessions]);

  // Add course with conflict check
  const addCourse = useCallback((course: Course): boolean => {
    if (selectedCourseIds.includes(course.id)) return false;
    
    const conflict = hasConflict(course);
    if (conflict.hasConflict) {
      toast.error('تداخل زمانی!', {
        description: `این درس با "${conflict.conflictWith}" تداخل دارد.`,
        duration: 3000,
      });
      return false;
    }
    
    setSelectedCourseIds(prev => [...prev, course.id]);
    toast.success('درس اضافه شد', {
      description: course.name,
      duration: 2000,
    });
    return true;
  }, [selectedCourseIds, hasConflict]);

  // Remove course
  const removeCourse = useCallback((courseId: string) => {
    const course = availableCourses.find(c => c.id === courseId);
    setSelectedCourseIds(prev => prev.filter(id => id !== courseId));
    if (course) {
      toast.info('درس حذف شد', {
        description: course.name,
        duration: 2000,
      });
    }
  }, []);

  // Clear all courses
  const clearAll = useCallback(() => {
    setSelectedCourseIds([]);
  }, []);

  // Toggle course (add/remove)
  const toggleCourse = useCallback((course: Course) => {
    if (selectedCourseIds.includes(course.id)) {
      removeCourse(course.id);
    } else {
      addCourse(course);
    }
  }, [selectedCourseIds, addCourse, removeCourse]);

  const value: ScheduleContextType = {
    selectedCourseIds,
    hoveredCourseId,
    selectedCourses,
    scheduledSessions,
    totalUnits,
    addCourse,
    removeCourse,
    clearAll,
    toggleCourse,
    setHoveredCourseId,
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