import { useCallback, useEffect, useState } from 'react';
import type { Credentials, Student } from '@/types/student';
import {
  saveCredentials,
  getCredentials,
  clearCredentials,
  saveStudentData,
  getStudentData,
  clearStudentData,
} from '@/lib/studentStorage';
import { mockFetchStudentProfile } from '@/services/api';

interface UseStudentProfileState {
  student: Student | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface UseStudentProfile extends UseStudentProfileState {
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
}

export function useStudentProfile(): UseStudentProfile {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const performLogin = useCallback(
    async (creds: Credentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const profile = await mockFetchStudentProfile(creds.username, creds.password);
        saveCredentials(creds);
        saveStudentData(profile);
        setStudent(profile);
        setIsAuthenticated(true);
      } catch (err: any) {
        setError(err?.message || 'خطا در ورود');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const login = useCallback(
    async (username: string, password: string, rememberMe: boolean) => {
      const creds: Credentials = { username, password, rememberMe };
      await performLogin(creds);
    },
    [performLogin],
  );

  const logout = useCallback(() => {
    clearCredentials();
    clearStudentData();
    setStudent(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // On mount: try to restore from storage
  useEffect(() => {
    const storedStudent = getStudentData();
    const storedCreds = getCredentials();

    if (storedStudent) {
      setStudent(storedStudent);
      setIsAuthenticated(true);
      return;
    }

    if (storedCreds) {
      performLogin(storedCreds);
    }
  }, [performLogin]);

  return {
    student,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
  };
}