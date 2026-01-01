import { useState } from 'react';
import { Calendar, Download, Printer } from 'lucide-react';
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
import { toast } from 'sonner';

const ExamScheduleDialog = () => {
  const { selectedCourses } = useSchedule();

  // Sort exams by date
  const exams = selectedCourses
    .filter(c => c.examDate)
    .map(c => ({
      id: c.id,
      name: c.name,
      courseId: c.courseId,
      instructor: c.instructor,
      date: c.examDate,
      time: c.examTime || 'اعلام نشده',
      location: c.sessions[0]?.location || 'اعلام نشده',
      credits: c.credits,
    }))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Find conflicting exams (same date & time)
  const conflictingIds = new Set<string>();
  exams.forEach((exam, i) => {
    exams.forEach((other, j) => {
      if (i !== j && exam.date === other.date && exam.time === other.time && exam.time !== 'اعلام نشده') {
        conflictingIds.add(exam.id);
        conflictingIds.add(other.id);
      }
    });
  });

  const handleExport = () => {
    // Create CSV content
    const headers = ['نام درس', 'کد درس', 'استاد', 'تاریخ امتحان', 'ساعت امتحان', 'محل برگزاری', 'واحد'];
    const rows = exams.map(exam => [
      exam.name,
      exam.courseId,
      exam.instructor,
      exam.date || '-',
      exam.time,
      exam.location,
      exam.credits.toString()
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exam-schedule.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('فایل اکسل دانلود شد');
  };

  const handlePrint = () => {
    window.print();
    toast.success('آماده چاپ');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">جدول امتحانات</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-primary text-primary-foreground -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              برنامه امتحانات
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs gap-1.5"
                onClick={handlePrint}
              >
                <Printer className="h-3.5 w-3.5" />
                چاپ
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs gap-1.5"
                onClick={handleExport}
              >
                <Download className="h-3.5 w-3.5" />
                صدور اکسل
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            تنها دروسی که در جدول اصلی قرار داده‌اید نمایش داده می‌شوند.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4">
          {exams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">هیچ درسی انتخاب نشده است</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10">
                    <TableHead className="text-right text-xs font-bold py-3">نام درس</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">کد درس</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">استاد</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">زمان کلاس</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">زمان امتحان</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">واحد</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">محل برگزاری</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam, index) => (
                    <TableRow 
                      key={exam.id}
                      className={`
                        ${conflictingIds.has(exam.id) ? 'bg-destructive/10' : index % 2 === 0 ? 'bg-muted/20' : ''}
                        hover:bg-muted/40 transition-colors
                      `}
                    >
                      <TableCell className={`text-xs font-medium py-3 ${conflictingIds.has(exam.id) ? 'text-destructive' : ''}`}>
                        {exam.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-3 font-mono">
                        {exam.courseId}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-3">
                        {exam.instructor}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-3">
                        <div className="flex flex-col">
                          <span>{exam.date}</span>
                          <span className="text-[10px]">{exam.time}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-xs py-3 ${conflictingIds.has(exam.id) ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                        {exam.time}
                      </TableCell>
                      <TableCell className="text-xs text-center py-3">
                        {exam.credits}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-3">
                        {exam.location}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {exams.length > 0 && (
          <div className="bg-primary/10 -mx-6 -mb-6 px-6 py-3 mt-4 rounded-b-lg">
            <div className="flex items-center justify-center gap-4 text-xs">
              <span>📚 دروس: {exams.length}</span>
              <span>|</span>
              <span>📦 واحدها: {exams.reduce((sum, e) => sum + e.credits, 0)}</span>
              <span>|</span>
              <span>📆 روزها: {new Set(exams.map(e => e.date)).size}</span>
            </div>
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
