import type { Credentials, Student } from '@/types/student';

const CREDENTIALS_KEY = 'golestoon_student_credentials';
const STUDENT_KEY = 'golestoon_student_profile';

// Very lightweight obfuscation to avoid plain-text storage.
// NOTE: This is not real cryptographic security, but better than nothing
// in a purely client-side environment.
function encode(value: string): string {
  try {
    const reversed = value.split('').reverse().join('');
    return btoa(reversed);
  } catch {
    return '';
  }
}

function decode(value: string): string {
  try {
    const decoded = atob(value);
    return decoded.split('').reverse().join('');
  } catch {
    return '';
  }
}

export function saveCredentials(creds: Credentials): void {
  if (typeof window === 'undefined') return;

  const payload = {
    username: encode(creds.username),
    password: encode(creds.password),
    rememberMe: creds.rememberMe,
  };

  const serialized = JSON.stringify(payload);

  // Always clear both first to avoid duplicates
  window.localStorage.removeItem(CREDENTIALS_KEY);
  window.sessionStorage.removeItem(CREDENTIALS_KEY);

  if (creds.rememberMe) {
    window.localStorage.setItem(CREDENTIALS_KEY, serialized);
  } else {
    window.sessionStorage.setItem(CREDENTIALS_KEY, serialized);
  }
}

export function getCredentials(): Credentials | null {
  if (typeof window === 'undefined') return null;

  const raw =
    window.localStorage.getItem(CREDENTIALS_KEY) ??
    window.sessionStorage.getItem(CREDENTIALS_KEY);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      username: string;
      password: string;
      rememberMe: boolean;
    };

    return {
      username: decode(parsed.username),
      password: decode(parsed.password),
      rememberMe: parsed.rememberMe ?? false,
    };
  } catch {
    return null;
  }
}

export function clearCredentials(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CREDENTIALS_KEY);
  window.sessionStorage.removeItem(CREDENTIALS_KEY);
}

export function saveStudentData(student: Student): void {
  if (typeof window === 'undefined') return;

  try {
    const serialized = JSON.stringify(student);
    window.localStorage.setItem(STUDENT_KEY, serialized);
  } catch {
    // ignore
  }
}

export function getStudentData(): Student | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(STUDENT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Student;
  } catch {
    return null;
  }
}

export function clearStudentData(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STUDENT_KEY);
}