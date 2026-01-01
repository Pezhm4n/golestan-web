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

interface StudentProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data for terms
const termData = [
  { term: 'نیمسال اول ۱۴۰۲-۱۴۰۳', gpa: 15.77, passedUnits: '16/16' },
  { term: 'نیمسال دوم ۱۴۰۲-۱۴۰۳', gpa: 16.38, passedUnits: '15/18' },
  { term: 'تابستان ۱۴۰۲-۱۴۰۳', gpa: 20.00, passedUnits: '3/3' },
  { term: 'نیمسال اول ۱۴۰۳-۱۴۰۴', gpa: 18.13, passedUnits: '18/18' },
  { term: 'نیمسال دوم ۱۴۰۳-۱۴۰۴', gpa: 15.47, passedUnits: '22/22' },
];

const chartData = [
  { name: 'ترم ۱', gpa: 15.77 },
  { name: 'ترم ۲', gpa: 16.38 },
  { name: 'ترم ۳', gpa: 18.13 },
  { name: 'ترم ۴', gpa: 15.47 },
  { name: 'ترم ۵', gpa: 17.20 },
];

const termCourses = [
  { name: 'برنامه‌نویسی پیشرفته', units: 3, grade: 18.5, status: 'قبول', term: 'نیمسال دوم ۱۴۰۳-۱۴۰۴' },
  { name: 'پایگاه داده', units: 3, grade: 17.0, status: 'قبول', term: 'نیمسال دوم ۱۴۰۳-۱۴۰۴' },
  { name: 'شبکه‌های کامپیوتری', units: 3, grade: 16.25, status: 'قبول', term: 'نیمسال دوم ۱۴۰۳-۱۴۰۴' },
];

const StudentProfileDialog = ({ open, onOpenChange }: StudentProfileDialogProps) => {
  const [predictUnits, setPredictUnits] = useState(17);
  const [predictGrade, setPredictGrade] = useState(17.00);

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
                    {termData.map((term, idx) => (
                      <tr key={idx} className={`border-b border-border/50 ${idx === 0 ? 'bg-primary/5' : ''}`}>
                        <td className="py-2 px-2 text-xs">{term.term}</td>
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
                    {termCourses.map((course, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-2 px-2 text-xs">{course.name}</td>
                        <td className="text-center py-2 px-2 text-xs">{course.units}</td>
                        <td className="text-center py-2 px-2 text-xs font-medium">{course.grade.toFixed(2)}</td>
                        <td className="text-center py-2 px-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                            {course.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
            <Button variant="outline" size="sm" className="gap-1.5">
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
