import { useState } from 'react';
import { User, GraduationCap, BookOpen, Trophy, TrendingUp, Download, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/hooks/use-toast';

interface StudentProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data for terms
const termData = [
  { id: 1, term: 'نیمسال اول ۱۴۰۲-۱۴۰۳', gpa: 15.77, passedUnits: '16/16' },
  { id: 2, term: 'نیمسال دوم ۱۴۰۲-۱۴۰۳', gpa: 16.38, passedUnits: '15/18' },
  { id: 3, term: 'تابستان ۱۴۰۲-۱۴۰۳', gpa: 20.00, passedUnits: '3/3' },
  { id: 4, term: 'نیمسال اول ۱۴۰۳-۱۴۰۴', gpa: 18.13, passedUnits: '18/18' },
  { id: 5, term: 'نیمسال دوم ۱۴۰۳-۱۴۰۴', gpa: 15.47, passedUnits: '22/22' },
];

const chartData = [
  { name: 'ترم ۱', gpa: 15.77 },
  { name: 'ترم ۲', gpa: 16.38 },
  { name: 'ترم ۳', gpa: 18.13 },
  { name: 'ترم ۴', gpa: 15.47 },
  { name: 'ترم ۵', gpa: 17.20 },
];

// Mock courses for each term
const allTermCourses: Record<number, Array<{ name: string; units: number; grade: number; status: string }>> = {
  1: [
    { name: 'ریاضی عمومی ۱', units: 3, grade: 15.0, status: 'قبول' },
    { name: 'فیزیک ۱', units: 3, grade: 16.5, status: 'قبول' },
    { name: 'مبانی کامپیوتر', units: 3, grade: 17.0, status: 'قبول' },
    { name: 'زبان انگلیسی', units: 2, grade: 14.5, status: 'قبول' },
  ],
  2: [
    { name: 'ریاضی عمومی ۲', units: 3, grade: 16.0, status: 'قبول' },
    { name: 'فیزیک ۲', units: 3, grade: 15.5, status: 'قبول' },
    { name: 'برنامه‌نویسی مقدماتی', units: 3, grade: 18.0, status: 'قبول' },
    { name: 'ریاضیات گسسته', units: 3, grade: 17.0, status: 'قبول' },
  ],
  3: [
    { name: 'کارآموزی', units: 3, grade: 20.0, status: 'قبول' },
  ],
  4: [
    { name: 'ساختمان داده', units: 3, grade: 18.5, status: 'قبول' },
    { name: 'طراحی الگوریتم', units: 3, grade: 17.5, status: 'قبول' },
    { name: 'معماری کامپیوتر', units: 3, grade: 18.0, status: 'قبول' },
    { name: 'سیستم عامل', units: 3, grade: 19.0, status: 'قبول' },
  ],
  5: [
    { name: 'برنامه‌نویسی پیشرفته', units: 3, grade: 18.5, status: 'قبول' },
    { name: 'پایگاه داده', units: 3, grade: 17.0, status: 'قبول' },
    { name: 'شبکه‌های کامپیوتری', units: 3, grade: 16.25, status: 'قبول' },
    { name: 'هوش مصنوعی', units: 3, grade: 14.5, status: 'قبول' },
    { name: 'مهندسی نرم‌افزار', units: 3, grade: 15.0, status: 'قبول' },
  ],
};

const StudentProfileDialog = ({ open, onOpenChange }: StudentProfileDialogProps) => {
  const [predictUnits, setPredictUnits] = useState(17);
  const [predictGrade, setPredictGrade] = useState(17.00);
  const [selectedTermId, setSelectedTermId] = useState(5); // Default to latest term

  const selectedTermCourses = allTermCourses[selectedTermId] || [];

  const averageGPA = chartData.reduce((sum, d) => sum + d.gpa, 0) / chartData.length;
  const totalGPA = 16.83;
  const passedUnits = 74;
  const totalUnits = 140;
  const bestTerm = 20.00;

  // Calculate predicted GPA
  const currentTotalPoints = totalGPA * passedUnits;
  const newTotalPoints = currentTotalPoints + (predictGrade * predictUnits);
  const newTotalUnits = passedUnits + predictUnits;
  const predictedGPA = newTotalPoints / newTotalUnits;

  const handleDownloadTranscript = async () => {
    try {
      toast({
        title: 'در حال آماده‌سازی...',
        description: 'لطفاً صبر کنید',
      });

      // Fetch the Vazirmatn font
      const fontResponse = await fetch('/fonts/Vazirmatn-Regular.ttf');
      if (!fontResponse.ok) {
        throw new Error('Failed to load font');
      }
      const fontBuffer = await fontResponse.arrayBuffer();
      
      // Convert ArrayBuffer to base64
      const fontBytes = new Uint8Array(fontBuffer);
      let binary = '';
      for (let i = 0; i < fontBytes.length; i++) {
        binary += String.fromCharCode(fontBytes[i]);
      }
      const fontBase64 = btoa(binary);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Register the Persian font
      doc.addFileToVFS('Vazirmatn-Regular.ttf', fontBase64);
      doc.addFont('Vazirmatn-Regular.ttf', 'Vazirmatn', 'normal');
      doc.setFont('Vazirmatn');

      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.setTextColor(59, 130, 246);
      doc.text('کارنامه تحصیلی دانشجو - گلستون', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Student Info Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, yPos, pageWidth - 30, 40, 3, 3, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      yPos += 10;
      
      // Right-aligned Persian labels
      doc.text('نام دانشجو: کاربر مهمان', pageWidth - 20, yPos, { align: 'right' });
      doc.text('شماره دانشجویی: ۴۰۰۱۲۳۴۵۶', 20, yPos, { align: 'left' });
      yPos += 8;
      doc.text('دانشکده: فنی و مهندسی', pageWidth - 20, yPos, { align: 'right' });
      doc.text('رشته تحصیلی: مهندسی کامپیوتر', 20, yPos, { align: 'left' });
      yPos += 8;
      doc.text(`معدل کل: ${totalGPA.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
      doc.text(`واحدهای گذرانده: ${passedUnits} از ${totalUnits}`, 20, yPos, { align: 'left' });
      yPos += 8;
      doc.text(`بهترین معدل ترم: ${bestTerm.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 15;

      // Terms Summary Table
      doc.setFontSize(13);
      doc.setTextColor(59, 130, 246);
      doc.text('خلاصه ترم‌های تحصیلی', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [['واحدهای گذرانده', 'معدل ترم', 'ترم تحصیلی']],
        body: termData.map(term => [
          term.passedUnits,
          term.gpa.toFixed(2),
          term.term
        ]),
        styles: { 
          font: 'Vazirmatn', 
          fontSize: 9, 
          cellPadding: 3,
          halign: 'right'
        },
        headStyles: { 
          fillColor: [59, 130, 246], 
          textColor: 255,
          halign: 'right',
          font: 'Vazirmatn'
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // All Terms Courses
      termData.forEach((term) => {
        const courses = allTermCourses[term.id] || [];
        
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(16, 185, 129);
        doc.setFont('Vazirmatn');
        doc.text(`${term.term}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;

        if (courses.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['وضعیت', 'نمره', 'واحد', 'نام درس']],
            body: courses.map(course => [
              course.grade >= 10 ? 'قبول' : 'رد',
              course.grade.toFixed(2),
              course.units.toString(),
              course.name
            ]),
            styles: { 
              font: 'Vazirmatn', 
              fontSize: 8, 
              cellPadding: 2,
              halign: 'right'
            },
            headStyles: { 
              fillColor: [16, 185, 129], 
              textColor: 255,
              halign: 'right',
              font: 'Vazirmatn'
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 15, right: 15 },
          });
          yPos = (doc as any).lastAutoTable.finalY + 10;
        } else {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('درسی یافت نشد', pageWidth / 2, yPos, { align: 'center' });
          yPos += 10;
        }
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('Vazirmatn');
        doc.setTextColor(150, 150, 150);
        doc.text(
          `ساخته شده توسط گلستون - صفحه ${i} از ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save('کارنامه-گلستون.pdf');
      
      toast({
        title: 'کارنامه ذخیره شد',
        description: 'فایل PDF کارنامه با موفقیت دانلود شد',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'خطا در ذخیره کارنامه',
        description: 'مشکلی در ایجاد فایل PDF رخ داد. لطفاً دوباره تلاش کنید.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            پروفایل دانشجو
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Top Section - Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Card */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    کا
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-right">
                  <h3 className="font-bold text-lg">کاربر مهمان</h3>
                  <p className="text-sm text-muted-foreground">شماره دانشجویی: ۴۰۰۱۲۳۴۵۶</p>
                  <p className="text-sm text-muted-foreground">دانشکده: فنی و مهندسی</p>
                  <p className="text-sm text-muted-foreground">رشته: مهندسی کامپیوتر</p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">معدل کل:</span>
                <span className="font-bold text-lg">{totalGPA.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">واحدهای گذرانده:</span>
                <span className="font-medium">{passedUnits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">بهترین میانگین ترم:</span>
                <span className="font-medium text-emerald-600">{bestTerm.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* GPA Card */}
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">معدل کل</span>
              </div>
              <div className="text-3xl font-bold text-primary">{totalGPA.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">از ۲۰</div>
            </div>

            {/* Passed Units Card */}
            <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium">واحد گذرانده</span>
              </div>
              <div className="text-3xl font-bold text-emerald-600">{passedUnits}</div>
              <Progress value={(passedUnits / totalUnits) * 100} className="h-2 mt-2" />
              <div className="text-xs text-muted-foreground mt-1">از {totalUnits} واحد</div>
            </div>

            {/* Best Term Card */}
            <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium">بهترین ترم</span>
              </div>
              <div className="text-3xl font-bold text-amber-600">{bestTerm.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">میانگین</div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Terms Table */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                ترم‌های تحصیلی
                <span className="text-xs text-muted-foreground font-normal">(برای مشاهده دروس کلیک کنید)</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-2 px-2 text-xs text-muted-foreground">ترم</th>
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground">میانگین</th>
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground">واحدهای گذرانده</th>
                    </tr>
                  </thead>
                  <tbody>
                    {termData.map((term) => (
                      <tr 
                        key={term.id} 
                        className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-primary/10 ${selectedTermId === term.id ? 'bg-primary/15 ring-1 ring-primary/30' : ''}`}
                        onClick={() => setSelectedTermId(term.id)}
                      >
                        <td className="py-2 px-2 text-xs">
                          {selectedTermId === term.id && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary ml-1.5" />}
                          {term.term}
                        </td>
                        <td className={`text-center py-2 px-2 text-xs font-medium ${term.gpa >= 17 ? 'text-emerald-600' : ''}`}>
                          {term.gpa.toFixed(2)}
                        </td>
                        <td className="text-center py-2 px-2 text-xs">{term.passedUnits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Term Courses Table */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                دروس ترم
                <span className="text-xs text-primary font-normal">
                  ({termData.find(t => t.id === selectedTermId)?.term})
                </span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-2 px-2 text-xs text-muted-foreground">نام درس</th>
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground">واحد</th>
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground">نمره</th>
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTermCourses.length > 0 ? (
                      selectedTermCourses.map((course, idx) => (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="py-2 px-2 text-xs">{course.name}</td>
                          <td className="text-center py-2 px-2 text-xs">{course.units}</td>
                          <td className="text-center py-2 px-2 text-xs font-medium">{course.grade.toFixed(2)}</td>
                          <td className="text-center py-2 px-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${course.grade >= 10 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                              {course.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-xs text-muted-foreground">
                          درسی یافت نشد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* GPA Chart */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              نمودار معدل ترم‌ها
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <ReferenceLine 
                    y={averageGPA} 
                    stroke="hsl(var(--primary))" 
                    strokeDasharray="5 5" 
                    label={{ 
                      value: `میانگین: ${averageGPA.toFixed(2)}`, 
                      position: 'right',
                      fontSize: 11,
                      fill: 'hsl(var(--primary))'
                    }} 
                  />
                  <Bar dataKey="gpa" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GPA Prediction */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              پیش‌بینی معدل ترم بعد
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              با انتخاب تعداد واحد و نمره مورد انتظار، معدل احتمالی خود را محاسبه کنید
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-sm">تعداد واحد:</Label>
                <Input
                  type="number"
                  value={predictUnits}
                  onChange={(e) => setPredictUnits(Number(e.target.value))}
                  min={1}
                  max={24}
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">نمره پیش‌بینی:</Label>
                <Input
                  type="number"
                  value={predictGrade}
                  onChange={(e) => setPredictGrade(Number(e.target.value))}
                  min={0}
                  max={20}
                  step={0.25}
                  className="text-center"
                />
              </div>
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">معدل پیش‌بینی شده</div>
                <div className="text-2xl font-bold text-primary">{predictedGPA.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadTranscript}>
              <Download className="h-4 w-4" />
              ذخیره کارنامه
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileDialog;
