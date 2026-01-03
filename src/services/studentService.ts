import type { Student } from '@/types/student';

const STUDENT_PROFILE_ENDPOINT = 'http://localhost:8000/api/student/profile';

/**
 * Fetch the student profile from the real backend.
 *
 * This function deliberately does NOT fall back to any mock data.
 * If the request fails, it throws an Error so the UI can surface
 * the failure state to the user.
 */
export async function fetchStudentProfile(): Promise<Student> {
  try {
    const response = await fetch(STUDENT_PROFILE_ENDPOINT, {
      method: 'GET',
      // Include cookies when the backend relies on session auth.
      credentials: 'include',
    });

    if (!response.ok) {
      let message = `خطا در دریافت پروفایل دانشجو (کد ${response.status})`;

      try {
        const body = await response.json();
        if (body && typeof body === 'object' && 'detail' in body) {
          message = String((body as any).detail);
        }
      } catch {
        // Ignore JSON parse errors; keep default message.
      }

      throw new Error(message);
    }

    return (await response.json()) as Student;
  } catch (err: any) {
    // Network / connection errors (e.g. ERR_CONNECTION_REFUSED)
    // will be mapped to a user-friendly message.
    if (err?.name === 'TypeError' || err?.message === 'Failed to fetch') {
      throw new Error('سرور پروفایل دانشجو در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.');
    }

    throw err;
  }
}