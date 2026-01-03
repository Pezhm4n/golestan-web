import { useState } from 'react';
import { Plus, Clock, User, MapPin, BookOpen, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Course, WeekType, Gender, CourseType, CourseGroup, DAYS } from '@/types/course';

interface AddCourseDialogProps {
  onAddCourse: (course: Course) => void;
}

const AddCourseDialog = ({ onAddCourse }: AddCourseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [instructor, setInstructor] = useState('');
  const [credits, setCredits] = useState(3);
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [location, setLocation] = useState('');

  type SessionFormRow = {
    day: number;
    startTime: number;
    endTime: number;
    weekType: WeekType;
  };
  
  // Session info (allow multiple sessions)
  const [sessionRows, setSessionRows] = useState<SessionFormRow[]>([
    { day: 0, startTime: 8, endTime: 10, weekType: 'both' },
  ]);
  const [sessionErrors, setSessionErrors] = useState<string[]>([]);
  const [group, setGroup] = useState<CourseGroup>('specialized');

  const groupOptions: { value: CourseGroup; label: string }[] = [
    { value: 'specialized', label: 'تخصصی' },
    { value: 'general', label: 'عمومی' },
    { value: 'basic', label: 'پایه' },
  ];

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedInstructor = instructor.trim();

    if (!trimmedName) {
      toast.error('نام درس الزامی است');
      return;
    }

    if (!trimmedInstructor) {
      toast.error('نام استاد الزامی است');
      return;
    }

    if (sessionRows.length === 0) {
      toast.error('حداقل یک جلسه برای درس لازم است');
      return;
    }

    // Validate session rows (start time < end time)
    const newSessionErrors = sessionRows.map(() => '');
    let hasSessionError = false;

    sessionRows.forEach((row, index) => {
      if (row.startTime >= row.endTime) {
        newSessionErrors[index] = 'ساعت شروع باید قبل از ساعت پایان باشد';
        hasSessionError = true;
      }
    });

    if (hasSessionError) {
      setSessionErrors(newSessionErrors);
      toast.error('لطفاً خطاهای زمان برگزاری جلسات را اصلاح کنید');
      return;
    }

    setSessionErrors([]);

    const normalizedSessions = sessionRows.map((row) => ({
      day: row.day,
      startTime: row.startTime,
      endTime: row.endTime,
      location: location || 'نامشخص',
      weekType: row.weekType,
    }));

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
      departmentId: 'custom', // Custom courses
      group,
      sessions: normalizedSessions,
    };

    onAddCourse(newCourse);
    toast.success('درس اضافه شد', { description: trimmedName });
    
    // Reset form
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
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs flex-1">
          <Plus className="h-3.5 w-3.5" />
          افزودن درس
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            افزودن درس جدید
          </DialogTitle>
          <DialogDescription>
            اطلاعات درس را وارد کنید تا به لیست "دروس اضافه شده من" اضافه شود
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Course Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              نام درس *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ریاضی عمومی ۱"
              className="text-xs"
            />
          </div>

          {/* Course ID & Instructor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="courseId" className="text-xs">کد درس</Label>
              <Input
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="40121501"
                className="text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructor" className="text-xs flex items-center gap-1">
                <User className="h-3 w-3" />
                استاد
              </Label>
              <Input
                id="instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="دکتر احمدی"
                className="text-xs"
              />
            </div>
          </div>

          {/* Credits & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="credits" className="text-xs">تعداد واحد</Label>
              <Select value={credits.toString()} onValueChange={(v) => setCredits(parseInt(v))}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(c => (
                    <SelectItem key={c} value={c.toString()} className="text-xs">{c} واحد</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                محل برگزاری
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="کلاس 101"
                className="text-xs"
              />
            </div>
          </div>

          {/* Session Day & Time - multiple sessions */}
          <div className="grid gap-2">
            <Label className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              زمان برگزاری (می‌توانید چند جلسه اضافه کنید)
            </Label>
            <div className="space-y-2">
              {sessionRows.map((row, index) => (
                <div key={index} className="space-y-1">
                  <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-2 items-center">
                    <Select
                      value={row.day.toString()}
                      onValueChange={(v) =>
                        setSessionRows((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, day: parseInt(v) } : r,
                          ),
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
                          هر هفته
                        </SelectItem>
                        <SelectItem value="odd" className="text-xs">
                          هفته فرد
                        </SelectItem>
                        <SelectItem value="even" className="text-xs">
                          هفته زوج
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
                + افزودن جلسه
              </Button>
            </div>
          </div>

          {/* Week Type & Course Group */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">نوع درس</Label>
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
                تاریخ امتحان
              </Label>
              <Input
                id="examDate"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                placeholder="1403/04/15"
                className="text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="examTime" className="text-xs">ساعت امتحان</Label>
              <Input
                id="examTime"
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                placeholder="08:00"
                className="text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="text-xs">
            انصراف
          </Button>
          <Button onClick={handleSubmit} className="text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            افزودن درس
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;
