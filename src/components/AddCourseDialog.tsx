import { useEffect, useState } from 'react';
import { Plus, Clock, User, MapPin, BookOpen, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Course, WeekType, Gender, CourseType, CourseGroup, DAYS } from '@/types/course';

interface AddCourseDialogProps {
  onAddCourse: (course: Course) => void;
}

type SessionFormRow = {
  day: number;
  startTime: number;
  endTime: number;
  weekType: WeekType;
};

const AddCourseDialog = ({ onAddCourse }: AddCourseDialogProps) => {
  const { t } = useTranslation();
  const { addCustomCourse, editCourse, editingCourse, setEditingCourse } = useSchedule();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [instructor, setInstructor] = useState('');
  const [credits, setCredits] = useState(3);
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [location, setLocation] = useState('');

  // Session info (allow multiple sessions)
  const [sessionRows, setSessionRows] = useState<SessionFormRow[]>([
    { day: 0, startTime: 8, endTime: 10, weekType: 'both' },
  ]);
  const [sessionErrors, setSessionErrors] = useState<string[]>([]);
  const [group, setGroup] = useState<CourseGroup>('specialized');

  const isEditMode = !!editingCourse;

  const groupOptions: { value: CourseGroup; label: string }[] = [
    { value: 'specialized', label: t('addCourse.groupSpecialized') },
    { value: 'general', label: t('addCourse.groupGeneral') },
    { value: 'basic', label: t('addCourse.groupBasic') },
  ];

  const resetForm = () => {
    setName('');
    setCourseId('');
    setInstructor('');
    setCredits(3);
    setExamDate('');
    setExamTime('');
    setLocation('');
    setSessionRows([{ day: 0, startTime: 8, endTime: 10, weekType: 'both' }]);
    setSessionErrors([]);
    setGroup('specialized');
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedInstructor = instructor.trim();

    if (!trimmedName) {
      toast.error(t('addCourse.nameRequired'));
      return;
    }

    if (!trimmedInstructor) {
      toast.error(t('addCourse.instructorRequired'));
      return;
    }

    if (sessionRows.length === 0) {
      toast.error(t('addCourse.atLeastOneSession'));
      return;
    }

    // Validate session rows (start time < end time)
    const newSessionErrors = sessionRows.map(() => '');
    let hasSessionError = false;

    sessionRows.forEach((row, index) => {
      if (row.startTime >= row.endTime) {
        newSessionErrors[index] = t('addCourse.sessionTimeError');
        hasSessionError = true;
      }
    });

    if (hasSessionError) {
      setSessionErrors(newSessionErrors);
      toast.error(t('addCourse.sessionErrorsFix'));
      return;
    }

    setSessionErrors([]);

    const normalizedSessions = sessionRows.map((row) => ({
      day: row.day,
      startTime: row.startTime,
      endTime: row.endTime,
      location: location || t('addCourse.unknownLocation'),
      weekType: row.weekType,
    }));

    if (isEditMode && editingCourse) {
      // Edit existing custom course
      const updatedCourse: Course = {
        ...editingCourse,
        courseId: courseId || editingCourse.courseId,
        name: trimmedName,
        instructor: trimmedInstructor,
        credits,
        examDate,
        examTime,
        location,
        group,
        isGeneral: group === 'general',
        sessions: normalizedSessions,
      };

      editCourse(editingCourse.id, updatedCourse);
      toast.success(t('addCourse.editSuccess'), { description: trimmedName });
    } else {
      // Create a new custom course
      const newCourse: Course = {
        id: `custom_${Date.now()}`,
        courseId: courseId || `C${Date.now()}`,
        name: trimmedName,
        instructor: trimmedInstructor,
        credits,
        examDate,
        examTime,
        description: '',
        gender: 'mixed' as Gender,
        capacity: 30,
        enrolled: 0,
        type: 'theoretical' as CourseType,
        isGeneral: group === 'general',
        category: 'available',
        departmentId: 'custom',
        group,
        sessions: normalizedSessions,
      };

      if (onAddCourse) {
        onAddCourse(newCourse);
      } else {
        addCustomCourse(newCourse);
      }
      toast.success(t('addCourse.courseAdded'), { description: trimmedName });
    }

    // Reset form and close
    resetForm();
    setEditingCourse(null);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEditingCourse(null);
      resetForm();
    }
  };

  // When a course is selected for editing, pre-fill the form and open dialog
  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name);
      setCourseId(editingCourse.courseId);
      setInstructor(editingCourse.instructor);
      setCredits(editingCourse.credits);
      setExamDate(editingCourse.examDate || '');
      setExamTime(editingCourse.examTime || '');
      // Use first session's location as default; custom courses typically share it
      setLocation(editingCourse.sessions[0]?.location || '');
      setGroup(editingCourse.group);

      setSessionRows(
        editingCourse.sessions.map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          weekType: s.weekType,
        })),
      );
      setSessionErrors(new Array(editingCourse.sessions.length).fill(''));
      setOpen(true);
    }
  }, [editingCourse]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="h-9 px-3 gap-2 text-sm flex-1 font-semibold"
          onClick={() => {
            setEditingCourse(null);
            resetForm();
          }}
        >
          <Plus className="h-4 w-4" />
          {t('addCourse.trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {isEditMode ? t('addCourse.editTitle') : t('addCourse.title')}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? t('addCourse.editDescription') : t('addCourse.description')}
            </DialogDescription>
          </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Course Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {t('addCourse.nameLabel')}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('addCourse.namePlaceholder')}
              className="text-xs"
            />
          </div>

          {/* Course ID & Instructor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="courseId" className="text-xs">
                {t('addCourse.courseIdLabel')}
              </Label>
              <Input
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder={t('addCourse.courseIdPlaceholder')}
                className="text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructor" className="text-xs flex items-center gap-1">
                <User className="h-3 w-3" />
                {t('addCourse.instructorLabel')}
              </Label>
              <Input
                id="instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder={t('addCourse.instructorPlaceholder')}
                className="text-xs"
              />
            </div>
          </div>

          {/* Credits & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="credits" className="text-xs">
                {t('addCourse.creditsLabel')}
              </Label>
              <Select value={credits.toString()} onValueChange={(v) => setCredits(parseInt(v))}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((c) => (
                    <SelectItem key={c} value={c.toString()} className="text-xs">
                      {c} {t('labels.units')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {t('addCourse.locationLabel')}
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('addCourse.locationPlaceholder')}
                className="text-xs"
              />
            </div>
          </div>

          {/* Session Day & Time - multiple sessions */}
          <div className="grid gap-2">
            <Label className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t('addCourse.sessionsLabel')}
            </Label>
            <div className="space-y-2">
              {sessionRows.map((row, index) => (
                <div key={index} className="space-y-1">
                  <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-2 items-center">
                    <Select
                      value={row.day.toString()}
                      onValueChange={(v) =>
                        setSessionRows((prev) =>
                          prev.map((r, i) => (i === index ? { ...r, day: parseInt(v) } : r)),
                        )
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day, i) => (
                          <SelectItem key={i} value={i.toString()} className="text-xs">
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={row.startTime.toString()}
                      onValueChange={(v) =>
                        setSessionRows((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, startTime: parseInt(v) } : r,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 13 }, (_, i) => 7 + i).map((h) => (
                          <SelectItem key={h} value={h.toString()} className="text-xs">
                            {h}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={row.endTime.toString()}
                      onValueChange={(v) =>
                        setSessionRows((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, endTime: parseInt(v) } : r,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 13 }, (_, i) => 8 + i).map((h) => (
                          <SelectItem key={h} value={h.toString()} className="text-xs">
                            {h}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={row.weekType}
                      onValueChange={(v) =>
                        setSessionRows((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, weekType: v as WeekType } : r,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both" className="text-xs">
                          {t('addCourse.weekTypeAll')}
                        </SelectItem>
                        <SelectItem value="odd" className="text-xs">
                          {t('addCourse.weekTypeOdd')}
                        </SelectItem>
                        <SelectItem value="even" className="text-xs">
                          {t('addCourse.weekTypeEven')}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {sessionRows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => {
                          setSessionRows((prev) => prev.filter((_, i) => i !== index));
                          setSessionErrors((prev) => prev.filter((_, i) => i !== index));
                        }}
                      >
                        ×
                      </Button>
                    )}
                  </div>

                  {sessionErrors[index] && (
                    <p className="text-[10px] text-destructive pr-1">
                      {sessionErrors[index]}
                    </p>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start h-8 text-[11px] px-2"
                onClick={() => {
                  setSessionRows((prev) => [
                    ...prev,
                    { day: 0, startTime: 8, endTime: 10, weekType: 'both' },
                  ]);
                  setSessionErrors((prev) => [...prev, '']);
                }}
              >
                {t('addCourse.sessionsAdd')}
              </Button>
            </div>
          </div>

          {/* Week Type & Course Group */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">{t('addCourse.groupLabel')}</Label>
              <Select value={group} onValueChange={(v) => setGroup(v as CourseGroup)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exam Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="examDate" className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('addCourse.examDateLabel')}
              </Label>
              <Input
                id="examDate"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                placeholder={t('addCourse.examDatePlaceholder')}
                className="text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="examTime" className="text-xs">
                {t('addCourse.examTimeLabel')}
              </Label>
              <Input
                id="examTime"
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                placeholder={t('addCourse.examTimePlaceholder')}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="text-xs"
          >
            {t('addCourse.cancel')}
          </Button>
          <Button onClick={handleSubmit} className="text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {isEditMode ? t('addCourse.editSubmit') : t('addCourse.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;
