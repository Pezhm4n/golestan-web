import { supabase } from '@/lib/supabase';
import type { Course } from '@/types/course';

export type UserScheduleRecord = {
  id: string;
  name: string;
  courses: Course[];
  createdAt: number;
};

/**
 * Fetch all saved schedules for a given Supabase user.
 * Returned records are ordered by created_at DESC.
 */
export async function fetchUserSchedules(userId: string): Promise<UserScheduleRecord[]> {
  const { data, error } = await supabase
    .from('saved_schedules')
    .select('id, name, courses, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[scheduleService] fetchUserSchedules error:', error);
    throw error;
  }

  if (!data) return [];

  return data.map((row) => {
    const createdAt = row.created_at ? new Date(row.created_at as string).getTime() : Date.now();
    return {
      id: row.id as string,
      name: (row.name as string) ?? '',
      courses: (row.courses as Course[]) ?? [],
      createdAt,
    };
  });
}

/**
 * Save a new schedule for the given user.
 * Returns the created record in the same shape we use in the React app.
 */
export async function saveUserSchedule(
  userId: string,
  name: string,
  courses: Course[],
): Promise<UserScheduleRecord> {
  const payload = {
    user_id: userId,
    name,
    courses,
  };

  const { data, error } = await supabase
    .from('saved_schedules')
    .insert(payload)
    .select('id, name, courses, created_at')
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[scheduleService] saveUserSchedule error:', error);
    throw error;
  }

  const createdAt = data.created_at ? new Date(data.created_at as string).getTime() : Date.now();

  return {
    id: data.id as string,
    name: (data.name as string) ?? '',
    courses: (data.courses as Course[]) ?? [],
    createdAt,
  };
}

/**
 * Delete a saved schedule by id for the current user.
 * RLS policies ensure users can only delete their own schedules.
 */
export async function deleteUserSchedule(scheduleId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[scheduleService] deleteUserSchedule error:', error);
    throw error;
  }
}