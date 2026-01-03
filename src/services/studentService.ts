import type {
  CourseEnrollment,
  CourseStatus,
  SemesterRecord,
  Student,
} from '@/types/student';

const STUDENT_PROFILE_ENDPOINT = 'http://localhost:8000/api/student/profile';

/**
 * Raw models as they come from the Python/FastAPI backend.
 * These mirror the dataclasses in `_reference_logic/requests_scraper/models.py`
 * plus a few optional convenience fields that may be added on the server side.
 */

type RawCourseEnrollment = {
  course_code: string;
  course_name: string;
  course_units: number | string;
  course_type: string;
  grade_state: string;
  grade?: number | string | null;
};

type RawSemesterRecord = {
  semester_id: number | string;
  semester_description: string;
  semester_gpa?: number | string | null;
  units_taken?: number | string | null;
  units_passed?: number | string | null;
  units_failed?: number | string | null;
  units_dropped?: number | string | null;
  cumulative_gpa?: number | string | null;
  cumulative_units_passed?: number | string | null;
  semester_status?: string | null;
  semester_type?: string | null;
  probation_status?: string | null;
  courses?: RawCourseEnrollment[];
};

type RawStudent = {
  student_id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  father_name?: string;
  faculty?: string;
  department?: string;
  major?: string;
  degree_level?: string;
  study_type?: string;
  enrollment_status?: string;
  registration_permission?: boolean;
  overall_gpa?: number | string | null;
  total_units_passed?: number | string | null;
  total_probation?: number;
  consecutive_probation?: number;
  special_probation?: number;
  total_units?: number | string | null;
  best_term_gpa?: number | string | null;
  semesters?: RawSemesterRecord[];
  updated_at?: string;
  image_b64?: string | null;
};

/**
 * Utility helpers for safely converting dynamic JSON values.
 */

function toNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }
  return defaultValue;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null) return null;
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Map raw course/grade state coming from the backend to our high-level
 * CourseStatus enum used by the UI.
 */
function mapCourseStatus(raw: RawCourseEnrollment): CourseStatus {
  const grade = toNullableNumber(raw.grade);
  const state = (raw.grade_state || '').toString().trim();

  if (/حذف|withdraw/i.test(state)) {
    return 'withdrawn';
  }

  if (grade == null) {
    if (/در حال اخذ|در حال|in progress/i.test(state)) {
      return 'in_progress';
    }
    return 'unknown';
  }

  if (grade >= 10) {
    return 'passed';
  }

  return 'failed';
}

/**
 * Normalize a backend CourseEnrollment into the rich CourseEnrollment
 * model used by the web UI.
 */
function normalizeCourseEnrollment(
  raw: RawCourseEnrollment,
  termId: string,
): CourseEnrollment {
  const grade = toNullableNumber(raw.grade);
  const units = toNumber(raw.course_units, 0);
  const code = raw.course_code?.toString() ?? '';
  const baseId = code || raw.course_name || 'course';

  return {
    // Stable id: termId-code
    id: termId ? `${termId}-${baseId}` : baseId,
    code,
    name: raw.course_name ?? '',
    units,
    grade,
    status: mapCourseStatus(raw),
    term_id: termId,

    // Raw fields
    course_code: raw.course_code,
    course_name: raw.course_name,
    course_units: units,
    course_type: raw.course_type,
    grade_state: raw.grade_state,
  };
}

/**
 * Normalize a backend SemesterRecord into the SemesterRecord model.
 */
function normalizeSemesterRecord(raw: RawSemesterRecord): SemesterRecord {
  const termCode = raw.semester_id != null ? String(raw.semester_id) : '';
  const id = termCode || raw.semester_description || 'semester';

  const unitsPassed = toNumber(raw.units_passed, 0);
  const unitsTaken = toNumber(raw.units_taken, unitsPassed);

  const courses: CourseEnrollment[] = (raw.courses ?? []).map(course =>
    normalizeCourseEnrollment(course, id),
  );

  const termGpa = toNullableNumber(raw.semester_gpa);

  return {
    // Normalized fields
    id,
    term_code: termCode,
    term_name: raw.semester_description ?? termCode,
    term_gpa: termGpa,
    units_passed: unitsPassed,
    units_total: unitsTaken,
    courses,

    // Raw / passthrough fields
    semester_id:
      typeof raw.semester_id === 'number'
        ? raw.semester_id
        : Number.parseInt(String(raw.semester_id), 10),
    semester_description: raw.semester_description,
    semester_gpa: termGpa ?? 0,
    units_taken: unitsTaken,
    units_failed: toNumber(raw.units_failed, 0),
    units_dropped: toNumber(raw.units_dropped, 0),
    cumulative_gpa: toNullableNumber(raw.cumulative_gpa) ?? 0,
    cumulative_units_passed: toNumber(raw.cumulative_units_passed, unitsPassed),
    semester_status: raw.semester_status ?? null,
    semester_type: raw.semester_type ?? null,
    probation_status: raw.probation_status ?? null,
  };
}

/**
 * Convert the raw backend payload into the strongly-typed Student model
 * used throughout the React app. This function is the single place where
 * we normalise snake_case backend fields and derive convenience fields
 * like total_gpa, total_units and best_term_gpa.
 */
function normalizeStudentProfile(raw: RawStudent): Student {
  const semesters: SemesterRecord[] = (raw.semesters ?? []).map(
    normalizeSemesterRecord,
  );

  const overallGpa = toNullableNumber(raw.overall_gpa);
  const totalUnitsPassed = toNumber(raw.total_units_passed, 0);
  const totalUnits =
    raw.total_units != null ? toNumber(raw.total_units) : null;

  // If backend does not provide best_term_gpa, derive it from semesters.
  const derivedBestTermGpa =
    semesters.length === 0
      ? null
      : semesters.reduce<number | null>((best, sem) => {
          if (sem.term_gpa == null) return best;
          if (best == null || sem.term_gpa > best) return sem.term_gpa;
          return best;
        }, null);

  const bestTermGpa =
    raw.best_term_gpa != null
      ? toNullableNumber(raw.best_term_gpa)
      : derivedBestTermGpa;

  const nameFromParts = [raw.first_name, raw.last_name]
    .filter(part => part && String(part).trim() !== '')
    .join(' ')
    .trim();

  const displayName =
    (raw.name && String(raw.name).trim()) ||
    nameFromParts ||
    'Student';

  const updatedAt = raw.updated_at ?? new Date().toISOString();

  const student: Student = {
    student_id: raw.student_id,
    name: displayName,
    father_name: raw.father_name ?? '',
    faculty: raw.faculty ?? '',
    department: raw.department ?? '',
    major: raw.major ?? '',
    degree_level: raw.degree_level ?? '',
    study_type: raw.study_type ?? '',
    enrollment_status: raw.enrollment_status ?? '',
    registration_permission: Boolean(raw.registration_permission),
    overall_gpa: overallGpa,
    total_units_passed: totalUnitsPassed,
    total_probation: raw.total_probation ?? 0,
    consecutive_probation: raw.consecutive_probation ?? 0,
    special_probation: raw.special_probation ?? 0,
    semesters,
    updated_at: updatedAt,
    image_b64: raw.image_b64 ?? null,

    // Web-UI convenience / derived fields
    total_gpa: overallGpa,
    total_units: totalUnits,
    best_term_gpa: bestTermGpa,

    // Optional camelCase mirrors for potential consumers
    firstName: raw.first_name,
    lastName: raw.last_name,
    fullName: displayName,
  };

  return student;
}

/**
 * Fetch the student profile from the real backend.
 *
 * This function deliberately does NOT fall back to any mock data.
 * If the request fails, it throws an Error so the UI can surface
 * the failure state to the user.
 */
export async function fetchStudentProfile(): Promise<Student> {
  let response: Response;

  try {
    response = await fetch(STUDENT_PROFILE_ENDPOINT, {
      method: 'GET',
      // Include cookies when the backend relies on session auth.
      credentials: 'include',
    });
  } catch (error: unknown) {
    // Network / connection errors (e.g. ECONNREFUSED, DNS issues)
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch student profile: ${error.message}`,
      );
    }

    throw new Error('Failed to fetch student profile: unknown error');
  }

  if (!response.ok) {
    let message = `Failed to fetch student profile (status ${response.status})`;

    try {
      const body = await response.json();
      if (body && typeof body === 'object') {
        if ('detail' in body && typeof (body as any).detail === 'string') {
          message = String((body as any).detail);
        } else if (
          'message' in body &&
          typeof (body as any).message === 'string'
        ) {
          message = String((body as any).message);
        }
      }
    } catch {
      // Ignore JSON parse errors; keep default message.
    }

    const error = new Error(message);
    (error as any).status = response.status;
    throw error;
  }

  const raw = (await response.json()) as RawStudent;
  return normalizeStudentProfile(raw);
}