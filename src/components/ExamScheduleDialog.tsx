import { useState } from 'react';
import { Calendar, Download, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
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
  const { t } = useTranslation();

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

  const handleExport = async () => {
    const table = document.getElementById('exam-table-container');
    if (!table) {
      toast.error(t('examDialog.exportError') || 'Failed to export exam schedule.');
      return;
    }

    try {
      const canvas = await html2canvas(table, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');

      try {
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('exam-schedule.pdf');
        toast.success(t('examDialog.exportSuccess'));
      } catch (err) {
        // Fallback: download as high‑quality PNG image
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'exam-schedule.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t('examDialog.exportSuccess'));
      }
    } catch (error) {
      console.error('[ExamScheduleDialog] Failed to export exams:', error);
      toast.error(t('examDialog.exportError') || 'Failed to export exam schedule.');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success(t('examDialog.printReady'));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          data-tour="exam-schedule"
          variant="outline"
          size="default"
          className="h-9 px-4 text-sm gap-2"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">{t('examDialog.trigger')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-primary text-primary-foreground -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              {t('examDialog.title')}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs gap-1.5"
                onClick={handlePrint}
              >
                <Printer className="h-3.5 w-3.5" />
                {t('examDialog.print')}
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs gap-1.5"
                onClick={handleExport}
              >
                <Download className="h-3.5 w-3.5" />
                {t('examDialog.export')}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            {t('examDialog.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4">
          {exams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">{t('examDialog.emptyTitle')}</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10">
                    <TableHead className="text-right text-xs font-bold py-3">{t('examDialog.headers.courseName')}</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">{t('examDialog.headers.courseCode')}</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">{t('examDialog.headers.instructor')}</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">{t('examDialog.headers.classTime')}</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">{t('examDialog.headers.examTime')}</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">{t('examDialog.headers.credits')}</TableHead>
                    <TableHead className="text-right text-xs font-bold py-3">{t('examDialog.headers.location')}</TableHead>
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
              <span>{t('examDialog.summary.courses', { count: exams.length })}</span>
              <span>|</span>
              <span>{t('examDialog.summary.credits', { credits: exams.reduce((sum, e) => sum + e.credits, 0) })}</span>
              <span>|</span>
              <span>{t('examDialog.summary.days', { days: new Set(exams.map(e => e.date)).size })}</span>
            </div>
          </div>
        )}

        {conflictingIds.size > 0 && (
          <div className="text-xs text-destructive flex items-center gap-1 mt-2">
            {t('examDialog.conflictNotice')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExamScheduleDialog;
