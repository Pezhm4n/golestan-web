import { useEffect, useState } from 'react';
import { User, GraduationCap, BookOpen, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { SemesterRecord, CourseEnrollment, Student } from '@/types/student';
import { fetchStudentProfile } from '@/services/studentService';

interface StudentProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentProfileDialog = ({ open, onOpenChange }: StudentProfileDialogProps) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch profile whenever the dialog is opened or the user hits Retry
  useEffect(() => {
    if (!open) return;

    let isCancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const profile = await fetchStudentProfile();
        if (!isCancelled) {
          setStudent(profile);
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        // Propagate a clear error message for the UI
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load student profile.';
        setError(message);
        setStudent(null);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [open, reloadKey]);

  const handleRetry = () => {
    setReloadKey(key => key + 1);
  };

  const overallGpa = student?.overall_gpa ?? student?.total_gpa ?? null;
  const totalPassedUnits = student?.total_units_passed ?? 0;
  const totalRequiredUnits = student?.total_units ?? null;
  const bestTermGpa = student?.best_term_gpa ?? null;

  const fullName = student?.name ?? 'کاربر مهمان';
  const major = student?.major ?? 'نامشخص';
  const faculty = student?.faculty ?? 'نامشخص';
  const department = student?.department ?? 'نامشخص';
  const degreeLevel = student?.degree_level ?? '';
  const studyType = student?.study_type ?? '';
  const enrollmentStatus = student?.enrollment_status ?? '';
  const studentId = student?.student_id ?? '—';

  const progressPercent =
    totalRequiredUnits && totalRequiredUnits > 0
      ? (totalPassedUnits / totalRequiredUnits) * 100
      : 0;

  const renderCourseStatus = (course: CourseEnrollment) => {
    switch (course.status) {
      case 'passed':
        return 'قبول';
      case 'failed':
        return 'رد';
      case 'in_progress':
        return 'در حال اخذ';
      case 'withdrawn':
        return 'حذف';
      default:
        return 'نامشخص';
    }
  };

  const formatGrade = (value: number | null | undefined) =>
    typeof value === 'number' ? value.toFixed(2) : '—';

  const sortedSemesters: SemesterRecord[] = student
    ? [...student.semesters].slice().sort((a, b) => {
        const codeA = a.term_code ?? a.id ?? '';
        const codeB = b.term_code ?? b.id ?? '';
        return codeB.localeCompare(codeA);
      })
    : [];

  const isConnectionError =
    typeof error === 'string' &&
    /fetch|network|connect|ECONNREFUSED/i.test(error);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            پروفایل دانشجو
          </DialogTitle>
          <DialogDescription className="sr-only">
            Student personal information and academic history
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                در حال دریافت اطلاعات دانشجو...
              </p>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center max-w-md mx-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">
                Cannot connect to the server. Please ensure the helper app is running.
              </p>
              {error && (
                <p className="text-[11px] text-muted-foreground break-words">
                  {error}
                </p>
              )}
              <div className="flex justify-center gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  تلاش مجدد
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && student && (
          <div className="space-y-6">
            {/* Top Section - Profile Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Card */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 border-2 border-primary/20 overflow-hidden">
                    {student?.image_b64 ? (
                      <AvatarImage
                        src={`data:image/png;base64,${student.image_b64}`}
                        alt={fullName}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {fullName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 text-right">
                    <h3 className="font-bold text-lg">{fullName}</h3>
                    <p className="text-sm text-muted-foreground">
                      شماره دانشجویی: {studentId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      دانشکده: {faculty}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      گروه آموزشی: {department}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      رشته: {major}
                    </p>
                    {(degreeLevel || studyType || enrollmentStatus) && (
                      <p className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 justify-end">
                        {degreeLevel && <span>مقطع: {degreeLevel}</span>}
                        {studyType && <span>نوع دوره: {studyType}</span>}
                        {enrollmentStatus && (
                          <span>وضعیت تحصیل: {enrollmentStatus}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">معدل کل:</span>
                  <span className="font-bold text-lg">
                    {formatGrade(overallGpa)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">واحدهای گذرانده:</span>
                  <span className="font-medium">{totalPassedUnits}</span>
                </div>
                {totalRequiredUnits && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">پیشرفت کل:</span>
                      <span className="text-xs text-muted-foreground">
                        {totalPassedUnits} از {totalRequiredUnits} واحد
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">بهترین میانگین ترم:</span>
                  <span className="font-medium text-emerald-600">
                    {formatGrade(bestTermGpa)}
                  </span>
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
                <div className="text-3xl font-bold text-primary">
                  {formatGrade(overallGpa)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">از 20</div>
              </div>

              {/* Passed Units Card */}
              <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">واحد گذرانده</span>
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  {totalPassedUnits}
                </div>
                {totalRequiredUnits && (
                  <>
                    <Progress value={progressPercent} className="h-2 mt-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      از {totalRequiredUnits} واحد
                    </div>
                  </>
                )}
              </div>

              {/* Best Term Card */}
              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium">بهترین ترم</span>
                </div>
                <div className="text-3xl font-bold text-amber-600">
                  {formatGrade(bestTermGpa)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">میانگین ترم</div>
              </div>
            </div>

            {/* Semesters Accordion */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                ترم‌های تحصیلی
                <span className="text-xs text-muted-foreground font-normal">
                  (برای مشاهده دروس، هر ترم را باز کنید)
                </span>
              </h4>
              {sortedSemesters.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  هیچ اطلاعاتی برای ترم‌ها یافت نشد.
                </p>
              ) : (
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {sortedSemesters.map(semester => (
                    <AccordionItem
                      key={semester.id}
                      value={semester.id}
                      className="border border-border/60 rounded-lg px-2"
                    >
                      <AccordionTrigger className="flex items-center justify-between py-2 gap-4">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-sm font-medium">
                            {semester.term_name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {semester.units_passed} واحد گذرانده از {semester.units_total} واحد
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-muted-foreground">
                            معدل ترم:{' '}
                            <span className="font-semibold text-foreground">
                              {formatGrade(semester.term_gpa)}
                            </span>
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        {semester.courses.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-3">
                            درسی برای این ترم ثبت نشده است.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-right py-2 px-2 text-[11px] text-muted-foreground">
                                    نام درس
                                  </th>
                                  <th className="text-center py-2 px-2 text-[11px] text-muted-foreground">
                                    کد
                                  </th>
                                  <th className="text-center py-2 px-2 text-[11px] text-muted-foreground">
                                    واحد
                                  </th>
                                  <th className="text-center py-2 px-2 text-[11px] text-muted-foreground">
                                    نمره
                                  </th>
                                  <th className="text-center py-2 px-2 text-[11px] text-muted-foreground">
                                    وضعیت
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {semester.courses.map((course: CourseEnrollment) => (
                                  <tr key={course.id} className="border-b border-border/40">
                                    <td className="py-2 px-2 text-xs">{course.name}</td>
                                    <td className="text-center py-2 px-2 text-xs">
                                      {course.code}
                                    </td>
                                    <td className="text-center py-2 px-2 text-xs">
                                      {course.units}
                                    </td>
                                    <td className="text-center py-2 px-2 text-xs font-medium">
                                      {formatGrade(course.grade)}
                                    </td>
                                    <td className="text-center py-2 px-2">
                                      <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                                          course.status === 'passed'
                                            ? 'bg-emerald-500/10 text-emerald-600'
                                            : course.status === 'failed'
                                            ? 'bg-destructive/10 text-destructive'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                      >
                                        {renderCourseStatus(course)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        )}

        {!isLoading && !error && !student && (
          <p className="text-sm text-muted-foreground text-center py-8">
            اطلاعاتی برای نمایش وجود ندارد.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileDialog;
