// Models for student profile and transcript data.
//
// These interfaces are designed to be compatible with the Python
// dataclasses defined in `_reference_logic/requests_scraper/models.py`,
// while also exposing a few convenience fields tailored for the web UI.

export type CourseStatus =
  | 'passed'
  | 'failed'
  | 'in_progress'
  | 'withdrawn'
  | 'unknown';

export interface CourseEnrollment {
  // ---- Normalized fields used by the web UI ----

  /** Unique id for this enrollment row (can be derived from code + term) */
  id: string;
  /** Golestan course code (normalized) */
  code: string;
  /** Course title (normalized) */
  name: string;
  /** Number of credits/units as plain number */
  units: number;
  /** Final grade (0-20) or null if not yet graded */
  grade: number | null;
  /** High-level status derived from grade / registration flags */
  status: CourseStatus;
  /** Foreign key to the semester this course belongs to */
  term_id: string;

  // ---- Raw fields mirroring Python CourseEnrollment dataclass ----

  /** Raw course code as stored in the legacy app */
  course_code?: string;
  /** Raw course name as stored in the legacy app */
  course_name?: string;
  /** Raw course units (Decimal in Python, number here) */
  course_units?: number;
  /** Course type label from Golestan / legacy app */
  course_type?: string;
  /** Raw grade state string (e.g. "نهایی", "در حال اخذ") */
  grade_state?: string;
}

export interface SemesterRecord {
  // ---- Normalized fields used by the web UI ----

  /** Internal id/key (usually same as term_code) */
  id: string;
  /** Term code, e.g. "4001", "4012" */
  term_code: string;
  /** Human readable name, e.g. "نیمسال اول 1402-1403" */
  term_name: string;
  /** GPA for this term (0-20) or null if incomplete */
  term_gpa: number | null;
  /** Units successfully passed in this term */
  units_passed: number;
  /** Total units taken in this term */
  units_total: number;
  /** Courses taken in this term */
  courses: CourseEnrollment[];

  // ---- Raw fields mirroring Python SemesterRecord dataclass ----

  /** Numeric semester id as used in the legacy app / database */
  semester_id?: number;
  /** Raw semester description from Golestan */
  semester_description?: string;
  /** Raw semester GPA (Decimal in Python, number here) */
  semester_gpa?: number;
  /** Units taken in this term (not just passed) */
  units_taken?: number;
  /** Units failed in this term */
  units_failed?: number;
  /** Units dropped/withdrawn in this term */
  units_dropped?: number;
  /** Cumulative GPA up to this term */
  cumulative_gpa?: number;
  /** Cumulative units passed up to this term */
  cumulative_units_passed?: number;
  /** Raw semester status label */
  semester_status?: string | null;
  /** Raw semester type label */
  semester_type?: string | null;
  /** Probation status label for this term, if any */
  probation_status?: string | null;
}

export interface Student {
  // ---- Core fields from Python Student dataclass ----

  /** Student id in Golestan (شماره دانشجویی) */
  student_id: string;
  /** Full display name, e.g. "علی علوی" */
  name: string;
  /** Father's name */
  father_name: string;
  /** Faculty name */
  faculty: string;
  /** Department name */
  department: string;
  /** Major / field of study */
  major: string;
  /** Degree level (e.g. کارشناسی، کارشناسی ارشد) */
  degree_level: string;
  /** Study type (e.g. روزانه، نوبت دوم) */
  study_type: string;
  /** Enrollment status (e.g. در حال تحصیل، فارغ‌التحصیل) */
  enrollment_status: string;
  /** Whether the student currently has registration permission */
  registration_permission: boolean;
  /** Overall GPA over all terms (0-20) as returned by Golestan */
  overall_gpa: number | null;
  /** Total units passed over all terms */
  total_units_passed: number;
  /** Number of probations in total */
  total_probation: number;
  /** Number of consecutive probations */
  consecutive_probation: number;
  /** Number of special probations */
  special_probation: number;
  /** All semester records for this student */
  semesters: SemesterRecord[];
  /** Last update timestamp from the backend (ISO string) */
  updated_at: string;
  /** Base64-encoded profile image (without data: prefix) */
  image_b64?: string | null;

  // ---- Web-UI convenience / derived fields ----

  /**
   * Total GPA over all terms (0-20), used by the web UI.
   * When coming from the backend this should match `overall_gpa`.
   */
  total_gpa?: number | null;
  /** Total required units for the program (if known) */
  total_units?: number | null;
  /** Best term GPA observed (0-20), derived from semesters */
  best_term_gpa?: number | null;

  // Optional fields to keep backward compatibility with earlier versions
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  level?: string;
  entryYear?: number | null;
}

export interface Credentials {
  username: string;
  password: string;
  rememberMe: boolean;
}