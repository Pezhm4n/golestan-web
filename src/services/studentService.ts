import type {
  CourseEnrollment,
  CourseStatus,
  SemesterRecord,
  Student,
} from '@/types/student';
import { getCredentials } from '@/lib/studentStorage';

const STUDENT_PROFILE_ENDPOINT = 'http://localhost:8000/api/student/profile';

/**
 * Raw models as they come from the backend.
 *
 * They support **both**:
 * - snake_case fields (Python/FastAPI backend)
 * - camelCase fields (Node/Golestan backend)
 */

type RawCourseEnrollment = {
  // snake_case (Python)
  course_code?: string;
  course_name?: string;
  course_units?: number | string;
  course_type?: string;
  grade_state?: string;
  grade?: number | string | null;

  // camelCase (Node Golestan)
  courseCode?: string;
  courseName?: string;
  courseUnits?: number | string;
  courseType?: string;
  gradeState?: string;
};

type RawSemesterRecord = {
  // snake_case (Python)
  semester_id?: number | string;
  semester_description?: string;
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

  // camelCase (Node Golestan)
  semesterId?: number | string;
  semesterDescription?: string;
  semesterGpa?: number | string | null;
  unitsTaken?: number | string | null;
  unitsPassed?: number | string | null;
  unitsFailed?: number | string | null;
  unitsDropped?: number | string | null;
  cumulativeGpa?: number | string | null;
  cumulativeUnitsPassed?: number | string | null;
  semesterStatus?: string | null;
  semesterType?: string | null;
  probationStatus?: string | null;

  courses?: RawCourseEnrollment[];
};

type RawStudent = {
  // snake_case (Python)
  student_id?: string;
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

  // camelCase (Node Golestan)
  studentId?: string;
  fatherName?: string;
  degreeLevel?: string;
  studyType?: string;
  enrollmentStatus?: string;
  registrationPermission?: boolean;
  overallGpa?: number | string | null;
  totalUnitsPassed?: number | string | null;
  totalProbation?: number;
  consecutiveProbation?: number;
  specialProbation?: number;
  totalUnits?: number | string | null;
  bestTermGpa?: number | string | null;
  updatedAt?: string;
  imageB64?: string | null;
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
  const stateRaw = raw.grade_state ?? raw.gradeState ?? '';
  const state = stateRaw.toString().trim();

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

  const codeRaw = raw.course_code ?? raw.courseCode;
  const nameRaw = raw.course_name ?? raw.courseName;
  const unitsRaw = raw.course_units ?? raw.courseUnits;
  const typeRaw = raw.course_type ?? raw.courseType;
  const gradeStateRaw = raw.grade_state ?? raw.gradeState;

  const units = toNumber(unitsRaw, 0);
  const code = codeRaw != null ? codeRaw.toString() : '';
  const baseId = code || nameRaw || 'course';

  return {
    // Stable id: termId-code (or termId-name) to avoid duplicate keys
    id: termId ? `${termId}-${baseId}` : baseId,
    code,
    name: nameRaw ?? '',
    units,
    grade,
    status: mapCourseStatus({
      ...raw,
      grade_state: gradeStateRaw ?? raw.grade_state,
    }),
    term_id: termId,

    // Raw fields
    course_code: codeRaw ?? '',
    course_name: nameRaw ?? '',
    course_units: units,
    course_type: typeRaw ?? '',
    grade_state: gradeStateRaw ?? '',
  };
}

/**
 * Normalize a backend SemesterRecord into the SemesterRecord model.
 */
function normalizeSemesterRecord(raw: RawSemesterRecord): SemesterRecord {
  const semesterIdRaw = raw.semester_id ?? raw.semesterId;
  const termCode =
    semesterIdRaw != null ? String(semesterIdRaw) : '';

  const description =
    raw.semester_description ?? raw.semesterDescription ?? termCode;

  const id = termCode || description || 'semester';

  const unitsPassed = toNumber(
    raw.units_passed ?? raw.unitsPassed,
    0,
  );
  const unitsTaken = toNumber(
    raw.units_taken ?? raw.unitsTaken,
    unitsPassed,
  );

  const courses: CourseEnrollment[] = (raw.courses ?? []).map(course =>
    normalizeCourseEnrollment(course, id),
  );

  const termGpa = toNullableNumber(
    raw.semester_gpa ?? raw.semesterGpa,
  );

  return {
    // Normalized fields
    id,
    term_code: termCode,
    term_name: description,
    term_gpa: termGpa,
    units_passed: unitsPassed,
    units_total: unitsTaken,
    courses,

    // Raw / passthrough fields
    semester_id:
      typeof semesterIdRaw === 'number'
        ? semesterIdRaw
        : Number.parseInt(String(semesterIdRaw ?? 0), 10),
    semester_description: description,
    semester_gpa: termGpa ?? 0,
    units_taken: unitsTaken,
    units_failed: toNumber(raw.units_failed ?? raw.unitsFailed, 0),
    units_dropped: toNumber(raw.units_dropped ?? raw.unitsDropped, 0),
    cumulative_gpa:
      toNullableNumber(
        raw.cumulative_gpa ?? raw.cumulativeGpa,
      ) ?? 0,
    cumulative_units_passed: toNumber(
      raw.cumulative_units_passed ?? raw.cumulativeUnitsPassed,
      unitsPassed,
    ),
    semester_status: raw.semester_status ?? raw.semesterStatus ?? null,
    semester_type: raw.semester_type ?? raw.semesterType ?? null,
    probation_status: raw.probation_status ?? raw.probationStatus ?? null,
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

  const overallGpa = toNullableNumber(
    raw.overall_gpa ?? raw.overallGpa,
  );
  const totalUnitsPassed = toNumber(
    raw.total_units_passed ?? raw.totalUnitsPassed,
    0,
  );

  const totalUnitsRaw = raw.total_units ?? raw.totalUnits;
  const totalUnits =
    totalUnitsRaw != null ? toNumber(totalUnitsRaw, 0) : null;

  // If backend does not provide best_term_gpa, derive it from semesters.
  const derivedBestTermGpa =
    semesters.length === 0
      ? null
      : semesters.reduce<number | null>((best, sem) => {
          if (sem.term_gpa == null) return best;
          if (best == null || sem.term_gpa > best) return sem.term_gpa;
          return best;
        }, null);

  const rawBestTerm =
    raw.best_term_gpa ?? raw.bestTermGpa ?? null;

  const bestTermGpa =
    rawBestTerm != null
      ? toNullableNumber(rawBestTerm)
      : derivedBestTermGpa;

  const nameFromParts = [raw.first_name, raw.last_name]
    .filter(part => part && String(part).trim() !== '')
    .join(' ')
    .trim();

  const displayName =
    (raw.name && String(raw.name).trim()) ||
    nameFromParts ||
    'Student';

  const updatedAt =
    raw.updated_at ?? raw.updatedAt ?? new Date().toISOString();

  const studentId = raw.student_id ?? raw.studentId ?? '';

  const fatherName = raw.father_name ?? raw.fatherName ?? '';
  const degreeLevel = raw.degree_level ?? raw.degreeLevel ?? '';
  const studyType = raw.study_type ?? raw.studyType ?? '';
  const enrollmentStatus =
    raw.enrollment_status ?? raw.enrollmentStatus ?? '';
  const registrationPermission =
    raw.registration_permission ??
    raw.registrationPermission ??
    false;

  const totalProbation =
    raw.total_probation ?? raw.totalProbation ?? 0;
  const consecutiveProbation =
    raw.consecutive_probation ??
    raw.consecutiveProbation ??
    0;
  const specialProbation =
    raw.special_probation ?? raw.specialProbation ?? 0;

  const imageB64 = raw.image_b64 ?? raw.imageB64 ?? null;

  const student: Student = {
    student_id: studentId,
    name: displayName,
    father_name: fatherName,
    faculty: raw.faculty ?? '',
    department: raw.department ?? '',
    major: raw.major ?? '',
    degree_level: degreeLevel,
    study_type: studyType,
    enrollment_status: enrollmentStatus,
    registration_permission: Boolean(registrationPermission),
    overall_gpa: overallGpa,
    total_units_passed: totalUnitsPassed,
    total_probation: totalProbation,
    consecutive_probation: consecutiveProbation,
    special_probation: specialProbation,
    semesters,
    updated_at: updatedAt,
    image_b64: imageB64,

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
 * If credentials are provided, they are sent via headers.
 * Otherwise we try to reuse any stored credentials (if available).
 *
 * This function deliberately does NOT fall back to any mock data.
 * If the request fails, it throws an Error so the UI can surface
 * the failure state to the user.
 */
export async function fetchStudentProfile(params?: {
  username: string;
  password: string;
}): Promise<Student> {
  let response: Response;

  const storedCreds = params ?? getCredentials() ?? undefined;
  const headers: HeadersInit = {};

  if (storedCreds) {
    headers['x-username'] = storedCreds.username;
    headers['x-password'] = storedCreds.password;
  }

  try {
    response = await fetch(STUDENT_PROFILE_ENDPOINT, {
      method: 'GET',
      // Include cookies when the backend relies on session auth.
      credentials: 'include',
      headers,
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