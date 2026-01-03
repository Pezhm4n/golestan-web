import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCourses } from '@/services/api';
import type { GolestanCourse, GolestanCoursesResponse } from '@/types/golestan';

export interface FlattenedCourse {
  faculty: string;
  department: string;
  course: GolestanCourse;
}

export interface DepartmentOption {
  id: string;       // composite key: faculty:::department
  faculty: string;
  name: string;     // department name
}

export interface UseGolestanDataResult {
  data: GolestanCoursesResponse | undefined;
  flattenedCourses: FlattenedCourse[];
  faculties: string[];
  departments: DepartmentOption[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Fetch courses from Golestoon scraper API and provide:
 * - raw hierarchical data (faculty -> department -> courses)
 * - flattened list for searching
 * - list of faculty names
 */
export function useGolestanData(): UseGolestanDataResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['golestan', 'courses'],
    queryFn: () => fetchCourses({ hierarchy: true, availability: 'both' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { flattenedCourses, faculties, departments } = useMemo(() => {
    const flat: FlattenedCourse[] = [];
    const facultyNames: string[] = [];
    const departmentOptions: DepartmentOption[] = [];
    const seenDepartments = new Set<string>();

    if (data) {
      for (const [facultyName, departmentsByName] of Object.entries(data)) {
        if (!facultyNames.includes(facultyName)) {
          facultyNames.push(facultyName);
        }
        for (const [deptName, courses] of Object.entries(departmentsByName)) {
          const id = `${facultyName}:::${deptName}`;
          if (!seenDepartments.has(id)) {
            seenDepartments.add(id);
            departmentOptions.push({
              id,
              faculty: facultyName,
              name: deptName,
            });
          }
          for (const course of courses) {
            flat.push({
              faculty: facultyName,
              department: deptName,
              course,
            });
          }
        }
      }
    }

    return {
      flattenedCourses: flat,
      faculties: facultyNames,
      departments: departmentOptions,
    };
  }, [data]);

  return {
    data,
    flattenedCourses,
    faculties,
    departments,
    isLoading,
    error: error as Error | null,
  };
}