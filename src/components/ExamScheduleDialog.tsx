import { useState } from 'react';
import { Calendar, Download, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const { t, i18n } = useTranslation();

  const coursesWithExam = selectedCourses.filter(c => c.examDate);
  const coursesWithoutExam = selectedCourses.filter(c => !c.examDate);

  // Sort exams by date
  const exams = coursesWithExam
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
    if (exams.length === 0) {
      toast.error(t('examDialog.exportEmpty') || 'هیچ امتحانی برای خروجی وجود ندارد.');
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Load Vazirmatn font so Persian text renders correctly
      let fontName = 'helvetica';
      try {
        const response = await fetch('/fonts/Vazirmatn-Regular.ttf');
        if (response.ok) {
          const blob = await response.blob();
          const base64 = await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result?.toString();
              if (!result) {
                resolve(null);
                return;
              }
              const base64data = result.split(',')[1];
              resolve(base64data || null);
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });

          if (base64) {
            // Register regular weight
            pdf.addFileToVFS('Vazirmatn.ttf', base64);
            pdf.addFont('Vazirmatn.ttf', 'Vazirmatn', 'normal');

            // Register a \"bold\" face pointing to the same file so that
            // using fontStyle: 'bold' for conflict rows and headers does
            // not fall back to a Latin-only font (which causes mojibake).
            pdf.addFileToVFS('Vazirmatn-Bold.ttf', base64);
            pdf.addFont('Vazirmatn-Bold.ttf', 'Vazirmatn', 'bold');

            pdf.setFont('Vazirmatn', 'normal');
            fontName = 'Vazirmatn';
          }
        }
      } catch (fontError) {
        // If font loading fails, fall back to default font
        console.error('[ExamScheduleDialog] Failed to load Vazirmatn font:', fontError);
      }

      // Signature text with app name and current site URL
      let origin = '';
      if (typeof window !== 'undefined' && window.location?.origin) {
        origin = window.location.origin;
      }
      const isFa = i18n.language?.startsWith('fa');
      const signatureText = origin
        ? (isFa ? `گلستون – ${origin}` : `Golestoon – ${origin}`)
        : (isFa ? 'گلستون' : 'Golestoon');

      // Title
      const title = t('examDialog.title');
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text(title, pageWidth - 14, 15, { align: 'right' });

      // Date
      const currentDate = new Date().toLocaleDateString('fa-IR');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`تاریخ صدور: ${currentDate}`, pageWidth - 14, 22, { align: 'right' });

      // Separator line
      pdf.setDrawColor(200);
      pdf.setLineWidth(0.4);
      pdf.line(14, 25, pageWidth - 14, 25);

      // Prepare table headers (RTL: last column appears on the right)
      const tableHeaders = [
        t('examDialog.headers.courseName'),
        t('examDialog.headers.courseCode'),
        t('examDialog.headers.instructor'),
        t('examDialog.headers.classTime'),
        t('examDialog.headers.examTime'),
        t('examDialog.headers.credits'),
        t('examDialog.headers.location'),
      ];

      const head = [tableHeaders.slice().reverse()];

      // Prepare body rows, matching header order (then reversed for RTL)
      const body = exams.map(exam =>
        [
          exam.name,
          exam.courseId,
          exam.instructor,
          `${exam.date}\n${exam.time}`,
          exam.time,
          String(exam.credits),
          exam.location,
        ].reverse(),
      );

      // Mark rows that have exam conflicts (same date & time)
      const conflictRowIndices = exams
        .map((exam, index) =>
          conflictingIds.has(exam.id) ? index : -1,
        )
        .filter(index => index !== -1);

      autoTable(pdf, {
        head,
        body,
        startY: 30,
        theme: 'striped',
        styles: {
          font: fontName,
          fontStyle: 'normal',
          fontSize: 9,
          cellPadding: 3,
          halign: 'right',
          valign: 'middle',
          textColor: [40, 40, 40],
        },
        headStyles: {
          fillColor: [79, 70, 229], // primary
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        didParseCell: data => {
          // برای فارسی، متن هدر را خودمان دستی می‌نویسیم تا encoding خراب نشود
          if (isFa && data.section === 'head') {
            data.cell.text = [''];
          }

          if (
            data.section === 'body' &&
            conflictRowIndices.includes(data.row.index)
          ) {
            // Highlight conflicting exam rows
            data.cell.styles.fillColor = [254, 226, 226]; // red-100
            data.cell.styles.textColor = [220, 38, 38]; // red-600
            data.cell.styles.fontStyle = 'bold';
          }
        },
        didDrawCell: data => {
          if (isFa && data.section === 'head') {
            const headerTexts = head[0];
            const headerText = headerTexts[data.column.index] ?? '';
            if (!headerText) return;

            pdf.setFont(fontName, 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);

            const cell = data.cell;
            const textX = cell.x + cell.width - 2;
            const textY = cell.y + cell.height / 2 + 2;

            pdf.text(headerText, textX, textY, {
              align: 'right',
              baseline: 'middle',
            });
          }
        },
        didDrawPage: data => {
          // Footer: page number (center) + Golestoon signature (left)
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          // Page number
          pdf.text(
            `${data.pageNumber}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' },
          );
          // Signature with site link
          if (signatureText) {
            pdf.setFontSize(7);
            pdf.setTextColor(120, 120, 120);
            pdf.text(
              signatureText,
              14,
              pageHeight - 8,
              { align: 'left' },
            );
          }
        },
        margin: { top: 30, right: 14, bottom: 16, left: 14 },
        showHead: 'everyPage',
      });

      // Optional summary under the table, if space allows on last page
      const finalY = (pdf as any).lastAutoTable?.finalY ?? 30;
      if (finalY < pageHeight - 20) {
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);

        const totalCredits = exams.reduce((sum, e) => sum + e.credits, 0);
        const uniqueDays = new Set(exams.map(e => e.date)).size;

        const summaryText = [
          t('examDialog.summary.courses', { count: exams.length }),
          t('examDialog.summary.credits', { credits: totalCredits }),
          t('examDialog.summary.days', { days: uniqueDays }),
        ].join('  |  ');

        pdf.text(summaryText, pageWidth / 2, finalY + 8, { align: 'center' });

        if (conflictingIds.size > 0) {
          pdf.setFontSize(8);
          pdf.setTextColor(220, 38, 38);
          pdf.text(
            t('examDialog.conflictNotice'),
            pageWidth - 14,
            finalY + 14,
            { align: 'right' },
          );
        }
      }

      pdf.save(`exam-schedule-${Date.now()}.pdf`);
      toast.success(t('examDialog.exportSuccess'));
    } catch (error) {
      console.error('[ExamScheduleDialog] Failed to export exams:', error);
      toast.error(t('examDialog.exportError') || 'Failed to export exam schedule.');
    }
  };

  const handleExportCsv = () => {
    if (exams.length === 0) {
      toast.error(t('examDialog.exportEmpty') || 'هیچ امتحانی برای خروجی وجود ندارد.');
      return;
    }

    try {
      // Header row
      const headers = [
        t('examDialog.headers.courseName'),
        t('examDialog.headers.courseCode'),
        t('examDialog.headers.instructor'),
        t('examDialog.headers.credits'),
        t('examDialog.headers.examTime'),
        t('examDialog.headers.classTime'),
        t('examDialog.headers.location'),
        // ستون تداخل امتحان (بله/خیر)
        t('examDialog.conflictNotice'),
      ];

      const escapeCsv = (value: unknown): string => {
        const raw =
          value === null || value === undefined
            ? ''
            : String(value);
        // اگر شامل , یا \" یا \\n باشد، در کوتیشن قرار بده
        if (/[",\n]/.test(raw)) {
          return `"${raw.replace(/"/g, '""')}"`;
        }
        return raw;
      };

      const rows = exams.map(exam => {
        const hasConflict = conflictingIds.has(exam.id);
        return [
          exam.name,
          exam.courseId,
          exam.instructor,
          exam.credits,
          exam.time,
          exam.date,
          exam.location,
          hasConflict ? '1' : '0',
        ];
      });

      const lines = [
        headers.map(escapeCsv).join(','),
        ...rows.map(row => row.map(escapeCsv).join(',')),
      ];

      // اضافه کردن BOM برای نمایش درست UTF-8 در Excel
      const csvContent = '\uFEFF' + lines.join('\r\n');
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam-schedule-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('examDialog.exportCsvSuccess'));
    } catch (error) {
      console.error('[ExamScheduleDialog] Failed to export CSV:', error);
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
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs gap-1.5"
                onClick={handleExportCsv}
              >
                <Download className="h-3.5 w-3.5" />
                {t('examDialog.exportCsv')}
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
              <div
                id="exam-table-export-only"
                className="p-4 bg-white dark:bg-zinc-950"
              >
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
            </div>
          )}
        </div>

        {coursesWithoutExam.length > 0 && (
          <div className="mt-3 border border-amber-300/70 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 text-xs">
            <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
              {t('examDialog.missingDatesTitle')}
            </p>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-200/80 mb-1.5">
              {t('examDialog.missingDatesDescription')}
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              {coursesWithoutExam.map(course => (
                <li key={course.id}>
                  <span className="font-medium">{course.name}</span>
                  {course.courseId && (
                    <span className="text-muted-foreground text-[11px] ml-1">
                      ({course.courseId})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

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
