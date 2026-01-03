// Mirrors the Python dataclasses in `_reference_logic/requests_scraper/models.py`

export type CourseStatus =
  | 'passed'
  | 'failed'
  | 'in_progress'
  | 'withdrawn'
  | 'unknown';

export interface CourseEnrollment {
  /** Unique id for this enrollment row (can be derived from code + term) */
  id: string;
  /** Golestan course code */
  code: string;
  /** Course title */
  name: string;
  /** Number of credits/units */
  units: number;
  /** Final grade (0-20) or null if not yet graded */
  grade: number | null;
  /** High-level status derived from grade / registration flags */
  status: CourseStatus;
  /** Foreign key to the semester this course belongs to */
  term_id: string;
}

export interface SemesterRecord {
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
}

export interface Student {
  /** Student id in Golestan (شماره دانشجویی) */
  student_id: string;
  /** Full display name, e.g. "علی علوی" */
  name: string;
  /** Major / field of study */
  major: string;
  /** Faculty name */
  faculty: string;
  /** Total GPA over all terms (0-20) */
  total_gpa: number | null;
  /** Total units passed over all terms */
  total_units_passed: number;
  /** Total required units for the program (if known) */
  total_units: number | null;
  /** Best term GPA observed (0-20) */
  best_term_gpa?: number | null;
  /** Base64-encoded profile image (without data: prefix) */
  image_b64?: string | null;
  /** All semester records for this student */
  semesters: SemesterRecord[];

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