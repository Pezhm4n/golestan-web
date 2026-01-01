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
  
  // Session info
  const [sessionDay, setSessionDay] = useState(0);
  const [startTime, setStartTime] = useState(8);
  const [endTime, setEndTime] = useState(10);
  const [weekType, setWeekType] = useState<WeekType>('both');
  const [group, setGroup] = useState<CourseGroup>('specialized');

  const groupOptions: { value: CourseGroup; label: string }[] = [
    { value: 'specialized', label: 'تخصصی' },
    { value: 'general', label: 'عمومی' },
    { value: 'basic', label: 'پایه' },
  ];

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('نام درس الزامی است');
      return;
    }

    const newCourse: Course = {
      id: `custom_${Date.now()}`,
      courseId: courseId || `C${Date.now()}`,
      name: name.trim(),
      instructor: instructor || 'نامشخص',
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
      sessions: [
        {
          day: sessionDay,
          startTime,
          endTime,
          location: location || 'نامشخص',
          weekType,
        }
      ]
    };

    onAddCourse(newCourse);
    toast.success('درس اضافه شد', { description: name });
    
    // Reset form
    setName('');
    setCourseId('');
    setInstructor('');
    setCredits(3);
    setExamDate('');
    setExamTime('');
    setLocation('');
    setSessionDay(0);
    setStartTime(8);
    setEndTime(10);
    setWeekType('both');
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
                placeholder="۴۰۱۲۱۵۰۱"
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
                placeholder="کلاس ۱۰۱"
                className="text-xs"
              />
            </div>
          </div>

          {/* Session Day & Time */}
          <div className="grid gap-2">
            <Label className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              زمان برگزاری
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={sessionDay.toString()} onValueChange={(v) => setSessionDay(parseInt(v))}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day, i) => (
                    <SelectItem key={i} value={i.toString()} className="text-xs">{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={startTime.toString()} onValueChange={(v) => setStartTime(parseInt(v))}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => 7 + i).map(h => (
                    <SelectItem key={h} value={h.toString()} className="text-xs">{h}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={endTime.toString()} onValueChange={(v) => setEndTime(parseInt(v))}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => 8 + i).map(h => (
                    <SelectItem key={h} value={h.toString()} className="text-xs">{h}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Week Type & Course Group */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">هفته</Label>
              <Select value={weekType} onValueChange={(v) => setWeekType(v as WeekType)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both" className="text-xs">هر هفته</SelectItem>
                  <SelectItem value="odd" className="text-xs">هفته فرد</SelectItem>
                  <SelectItem value="even" className="text-xs">هفته زوج</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">نوع درس</Label>
              <Select value={group} onValueChange={(v) => setGroup(v as CourseGroup)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
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
                placeholder="۱۴۰۳/۰۴/۱۵"
                className="text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="examTime" className="text-xs">ساعت امتحان</Label>
              <Input
                id="examTime"
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                placeholder="۰۸:۰۰"
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
