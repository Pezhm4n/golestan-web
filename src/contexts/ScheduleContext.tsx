import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Course, ScheduledSession } from '@/types/course';
import { toast } from 'sonner';
import { hasConflict as schedulerHasConflict } from '@/lib/scheduler';
import { useGolestanData } from '@/hooks/useGolestanData';
import { convertGolestanCourseToAppCourse } from '@/lib/converters';
import { useTranslation } from 'react-i18next';

export interface SavedSchedule {
  id: string;
  name: string;
  createdAt: number; // Timestamp (ms since epoch)
  courses: Course[];
}

interface ScheduleContextType {
  // State
  selectedCourseIds: string[];
  hoveredCourseId: string | null;
  customCourses: Course[];
  savedSchedules: SavedSchedule[];
  editingCourse: Course | null;

  // Derived
  selectedCourses: Course[];
  scheduledSessions: ScheduledSession[];
  totalUnits: number;
  allCourses: Course[];

  // Actions
  addCourse: (course: Course) => boolean;
  removeCourse: (courseId: string) => void;
  clearAll: () => void;
  /**
   * Restore or modify the current course list (used for undo / schedule loading).
   * Accepts either a full list of courses or a functional updater.
   */
  restoreCourses: (updater: Course[] | ((prev: Course[]) => Course[])) => void;
  toggleCourse: (course: Course) => void;
  setHoveredCourseId: (id: string | null) => void;
  setEditingCourse: (course: Course | null) => void;
  addCustomCourse: (course: Course) => void;
  removeCustomCourse: (courseId: string) => void;
  editCourse: (courseId: string, updated: Course) => void;
  saveSchedule: (name: string) => void;
  loadSchedule: (id: string) => void;
  deleteSchedule: (id: string) => void;

  // Helpers
  isCourseSelected: (courseId: string) => boolean;
  hasConflict: (course: Course) => {
    hasConflict: boolean;
    conflictWith?: string;
    reason?: string;
  };
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  // Selected courses are persisted as full Course objects
  const [selectedCourses, setSelectedCourses] = useState<Course[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('golestan_active_session');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as Course[];
    } catch {
      return [];
    }
  });

  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

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

  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('golestan_saved_schedules');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as SavedSchedule[];
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

  // Persist active session (selected courses) to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('golestan_active_session', JSON.stringify(selectedCourses));
    } catch {
      // ignore storage errors
    }
  }, [selectedCourses]);

  // Persist saved schedules to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('golestan_saved_schedules', JSON.stringify(savedSchedules));
    } catch {
      // ignore storage errors
    }
  }, [savedSchedules]);

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

  // Selected course IDs derived from selectedCourses
  const selectedCourseIds = useMemo(
    () => selectedCourses.map(c => c.id),
    [selectedCourses],
  );

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
      })),
    );
  }, [selectedCourses]);

  // Total units
  const totalUnits = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [selectedCourses]);

  // Check if a course is selected
  const isCourseSelected = useCallback(
    (courseId: string) => {
      return selectedCourseIds.includes(courseId);
    },
    [selectedCourseIds],
  );

  // Check for conflicts with a new course using core scheduler logic
  const hasConflict = useCallback(
    (course: Course): { hasConflict: boolean; conflictWith?: string; reason?: string } => {
      return schedulerHasConflict(selectedCourses, course);
    },
    [selectedCourses],
  );

  // Add course - allow conflicts but warn
  const addCourse = useCallback(
    (course: Course): boolean => {
      let added = false;

      setSelectedCourses(prev => {
        if (prev.some(c => c.id === course.id)) {
          return prev;
        }
        added = true;
        return [...prev, course];
      });

      if (!added) return false;

      const conflict = hasConflict(course);

      if (conflict.hasConflict) {
        const reasonKey =
          conflict.reason === 'exam' ? 'conflictExam' : 'conflictTime';
        const reasonLabel = t(`schedule.${reasonKey}`);

        toast.warning(reasonLabel + '!', {
          description: conflict.conflictWith
            ? t('schedule.conflictWithCourse', {
                course: conflict.conflictWith,
                reason: reasonLabel.toLowerCase(),
              })
            : t('schedule.conflictGeneric'),
          duration: 4000,
        });
      } else {
        toast.success(t('schedule.courseAdded'), {
          description: course.name,
          duration: 2000,
        });
      }
      return true;
    },
    [hasConflict, t],
  );

  // Remove course with undo support
  const removeCourse = useCallback(
    (courseId: string) => {
      const course = selectedCourses.find(c => c.id === courseId);

      setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
      // Clear any hover/preview state so ghost previews disappear immediately
      setHoveredCourseId(prev => (prev === courseId ? null : prev));

      if (!course) return;

      toast.success(t('schedule.courseRemoved'), {
        description: course.name,
        duration: 4000,
        action: {
          label: t('common.undo'),
          onClick: () => {
            setSelectedCourses(prev => {
              // اگر کاربر در این فاصله خودش درس را دوباره اضافه کرده باشد
              if (prev.some(c => c.id === course.id)) return prev;
              return [...prev, course];
            });
            setHoveredCourseId(null);
          },
        },
      });
    },
    [selectedCourses, t],
  );

  // Clear all courses (toast + undo handled at the UI layer)
  const clearAll = useCallback(() => {
    setSelectedCourses([]);
    setHoveredCourseId(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('golestan_active_session');
    }
  }, []);

  // Bulk restore / modify courses (used for undo/restore)
  const restoreCourses = useCallback(
    (updater: Course[] | ((prev: Course[]) => Course[])) => {
      setSelectedCourses(prev =>
        typeof updater === 'function' ? (updater as (prev: Course[]) => Course[])(prev) : updater,
      );
      setHoveredCourseId(null);
    },
    [],
  );

  // Toggle course (add/remove)
  const toggleCourse = useCallback(
    (course: Course) => {
      if (selectedCourseIds.includes(course.id)) {
        removeCourse(course.id);
      } else {
        addCourse(course);
      }
    },
    [selectedCourseIds, addCourse, removeCourse],
  );

  // Add a custom course
  const addCustomCourse = useCallback((course: Course) => {
    setCustomCourses(prev => [...prev, course]);
  }, []);

  // Permanently remove a custom course (and unselect it if needed)
  const removeCustomCourse = useCallback((courseId: string) => {
    setCustomCourses(prev => prev.filter(c => c.id !== courseId));
    setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
    // Clear hover/preview for this course if it was active
    setHoveredCourseId(prev => (prev === courseId ? null : prev));
  }, []);

  // Save current schedule snapshot
  const saveSchedule = useCallback(
    (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        toast.error(t('schedule.enterScheduleName'));
        return;
      }

      if (selectedCourses.length === 0) {
        toast.info(t('schedule.scheduleEmpty'));
        return;
      }

      const now = Date.now();
      const newSchedule: SavedSchedule = {
        id: now.toString(),
        name: trimmedName,
        createdAt: now,
        courses: selectedCourses,
      };

      setSavedSchedules(prev => [newSchedule, ...prev]);
      toast.success(t('schedule.scheduleSaved'), {
        description: t('schedule.scheduleSavedSummary', {
          count: selectedCourses.length,
        }),
      });
    },
    [selectedCourses, t],
  );

  // Edit an existing course (both in selectedCourses and customCourses)
  const editCourse = useCallback(
    (courseId: string, updated: Course) => {
      setSelectedCourses(prev =>
        prev.map(c => (c.id === courseId ? { ...updated, id: courseId } : c)),
      );
      setCustomCourses(prev =>
        prev.map(c => (c.id === courseId ? { ...updated, id: courseId } : c)),
      );
    },
    [],
  );

  // Load a saved schedule into the active session
  const loadSchedule = useCallback(
    (id: string) => {
      const schedule = savedSchedules.find(s => s.id === id);
      if (!schedule) {
        toast.error(t('schedule.notFound'));
        return;
      }

      setSelectedCourses(schedule.courses);
      setHoveredCourseId(null);
      toast.success(t('schedule.loaded'), {
        description: schedule.name,
      });
    },
    [savedSchedules, t],
  );

  // Delete a saved schedule
  const deleteSchedule = useCallback((id: string) => {
    setSavedSchedules(prev => prev.filter(s => s.id !== id));
    toast.info(t('schedule.deleted'));
  }, [t]);

  const value: ScheduleContextType = {
    selectedCourseIds,
    hoveredCourseId,
    customCourses,
    savedSchedules,
    editingCourse,
    selectedCourses,
    scheduledSessions,
    totalUnits,
    allCourses,
    addCourse,
    removeCourse,
    clearAll,
    restoreCourses,
    toggleCourse,
    setHoveredCourseId,
    setEditingCourse,
    addCustomCourse,
    removeCustomCourse,
    editCourse,
    saveSchedule,
    loadSchedule,
    deleteSchedule,
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
