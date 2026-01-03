import type {
  GolestanCoursesResponse,
  FacultiesWithDepartments,
} from '@/types/golestan';

const API_BASE_URL = 'https://golestoon-scraper.onrender.com';
const COURSES_ENDPOINT = `${API_BASE_URL}/api/courses/all`;

export type CourseAvailability = 'available' | 'unavailable' | 'both';

export interface FetchCoursesOptions {
  /**
   * When true, returns the hierarchical structure:
   * { [faculty]: { [department]: GolestanCourse[] } }
   * This matches how the Windows app groups data.
   */
  hierarchy?: boolean;
  /**
   * Filter by availability; backend supports the same flags
   * used in the legacy Python code.
   */
  availability?: CourseAvailability;
  signal?: AbortSignal;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      if (errorBody && typeof errorBody === 'object' && 'detail' in errorBody) {
        message = String(errorBody.detail);
      }
    } catch {
      // Ignore JSON parse errors and keep default message
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch all courses from the Golestoon scraper API.
 * Returns a hierarchical structure grouped by faculty and department.
 *
 * The default options mirror the behavior of the reference Python app,
 * but request hierarchical data which is easier to use for building
 * selectors and navigation in the web UI.
 */
export async function fetchCourses(
  options: FetchCoursesOptions = {},
): Promise<GolestanCoursesResponse> {
  const {
    hierarchy = true,
    availability = 'both',
    signal,
  } = options;

  const params = new URLSearchParams();
  params.set('hierarchy', String(hierarchy));
  params.set('availability', availability);

  const url = `${COURSES_ENDPOINT}?${params.toString()}`;

  return request<GolestanCoursesResponse>(url, { signal });
}

/**
 * Convenience helper similar to CourseDatabase.get_faculties_with_departments()
 * in the desktop app. It flattens the hierarchical course response into
 * a simple faculty -> [departments] mapping.
 */
export async function fetchFacultiesWithDepartments(
  options?: FetchCoursesOptions,
): Promise<FacultiesWithDepartments> {
  const coursesByFaculty = await fetchCourses(options);
  const result: FacultiesWithDepartments = {};

  for (const [facultyName, departments] of Object.entries(coursesByFaculty)) {
    const departmentNames = Object.keys(departments);
    if (!facultyName) continue;
    result[facultyName] = departmentNames;
  }

  if (Object.keys(result).length === 0) {
    result.General = ['All Departments'];
  }

  return result;
}