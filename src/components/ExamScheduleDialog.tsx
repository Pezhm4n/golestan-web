import { Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSchedule } from '@/contexts/ScheduleContext';

const ExamScheduleDialog = () => {
  const { selectedCourses } = useSchedule();

  // Sort exams by date
  const exams = selectedCourses
    .filter(c => c.examDate)
    .map(c => ({
      id: c.id,
      name: c.name,
      courseId: c.courseId,
      date: c.examDate,
      time: c.examTime || '-',
    }))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Find conflicting exams (same date & time)
  const conflictingIds = new Set<string>();
  exams.forEach((exam, i) => {
    exams.forEach((other, j) => {
      if (i !== j && exam.date === other.date && exam.time === other.time && exam.time !== '-') {
        conflictingIds.add(exam.id);
        conflictingIds.add(other.id);
      }
    });
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">جدول امتحانات</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            برنامه امتحانات
          </DialogTitle>
          <DialogDescription>
            لیست امتحانات دروس انتخاب شده به ترتیب تاریخ
          </DialogDescription>
        </DialogHeader>

        {exams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            هیچ درسی انتخاب نشده است
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right text-xs">نام درس</TableHead>
                  <TableHead className="text-right text-xs">تاریخ</TableHead>
                  <TableHead className="text-right text-xs">ساعت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow 
                    key={exam.id}
                    className={conflictingIds.has(exam.id) ? 'bg-destructive/10' : ''}
                  >
                    <TableCell className={`text-xs font-medium ${conflictingIds.has(exam.id) ? 'text-destructive' : ''}`}>
                      {exam.name}
                    </TableCell>
                    <TableCell className={`text-xs ${conflictingIds.has(exam.id) ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                      {exam.date || '-'}
                    </TableCell>
                    <TableCell className={`text-xs ${conflictingIds.has(exam.id) ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                      {exam.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {conflictingIds.size > 0 && (
          <div className="text-xs text-destructive flex items-center gap-1 mt-2">
            ⚠️ ردیف‌های قرمز نشان‌دهنده تداخل امتحان هستند
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExamScheduleDialog;
