import { useEffect, useState } from 'react';
import { User, GraduationCap, BookOpen, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { SemesterRecord, CourseEnrollment, Student } from '@/types/student';
import { fetchStudentProfile } from '@/services/studentService';
import {
  getCredentials,
  getStudentData,
  saveCredentials,
  saveStudentData,
  clearCredentials,
  clearStudentData,
} from '@/lib/studentStorage';

interface StudentProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentProfileDialog = ({ open, onOpenChange }: StudentProfileDialogProps) => {
  const { t } = useTranslation();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeAuthErrorMessage = (message: string): string => {
    if (
      /CAPTCHA_FAILED/i.test(message) ||
      /Authentication failed/i.test(message) ||
      /invalid credentials/i.test(message) ||
      /username and password/i.test(message)
    ) {
      return t('studentProfile.loginErrorAuth');
    }
    return message;
  };

  // Fetch profile whenever the dialog is opened or the user hits Retry
  useEffect(() => {
    if (!open) return;

    let isCancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      setInfoMessage(null);
      setShowCredentialsForm(false);

      try {
        // 1) If we already have cached student data, use it
        const cachedStudent = getStudentData();
        if (cachedStudent && !isCancelled) {
          setStudent(cachedStudent);
          return;
        }

        // 2) Try stored credentials (localStorage/sessionStorage)
        const storedCreds = getCredentials();

        if (!storedCreds) {
          if (!isCancelled) {
            setInfoMessage(t('studentProfile.loginIntro'));
            setShowCredentialsForm(true);
          }
          return;
        }

        if (!isCancelled) {
          setUsername(storedCreds.username);
          setRememberMe(storedCreds.rememberMe);
        }

        const profile = await fetchStudentProfile({
          username: storedCreds.username,
          password: storedCreds.password,
        });

        if (!isCancelled) {
          setStudent(profile);
          saveStudentData(profile);
        }
      } catch (err: unknown) {
        if (isCancelled) return;

        const rawMessage =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load student profile.';
        const message = normalizeAuthErrorMessage(rawMessage);

        setError(message);
        setInfoMessage(null);
        setStudent(null);
        setShowCredentialsForm(true);
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

  const handleSubmitCredentials = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError(t('studentProfile.loginMissingCredentials'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setInfoMessage(null);

    try {
      const profile = await fetchStudentProfile({
        username: trimmedUsername,
        password: trimmedPassword,
      });

      const creds = {
        username: trimmedUsername,
        password: trimmedPassword,
        rememberMe,
      };
      saveCredentials(creds);
      saveStudentData(profile);
      setStudent(profile);
      setShowCredentialsForm(false);
    } catch (err: unknown) {
      const rawMessage =
        err instanceof Error && err.message
          ? err.message
          : t('studentProfile.genericLoadError');
      const message = normalizeAuthErrorMessage(rawMessage);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setReloadKey(key => key + 1);
  };

  const handleResetProfile = () => {
    clearCredentials();
    clearStudentData();
    setStudent(null);
    setError(null);
    setInfoMessage(
      t('studentProfile.loginAgainAfterReset'),
    );
    setUsername('');
    setPassword('');
    setShowCredentialsForm(true);
  };

  const overallGpa = student?.overall_gpa ?? student?.total_gpa ?? null;
  const totalPassedUnits = student?.total_units_passed ?? 0;
  const totalRequiredUnits = student?.total_units ?? null;
  const bestTermGpa = student?.best_term_gpa ?? null;

  const fullName = student?.name ?? t('studentProfile.guestUser');
  const major = student?.major ?? t('studentProfile.unknown');
  const faculty = student?.faculty ?? t('studentProfile.unknown');
  const department = student?.department ?? t('studentProfile.unknown');
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
        return t('studentProfile.semesters.statusPassed');
      case 'failed':
        return t('studentProfile.semesters.statusFailed');
      case 'in_progress':
        return t('studentProfile.semesters.statusInProgress');
      case 'withdrawn':
        return t('studentProfile.semesters.statusWithdrawn');
      default:
        return t('studentProfile.semesters.statusUnknown');
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

  const isBusy = isLoading || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              {t('studentProfile.dialogTitle')}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={handleResetProfile}
            >
              {t('studentProfile.changeAccount')}
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Student personal information and academic history
          </DialogDescription>
        </DialogHeader>

        {isBusy && (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                {isSubmitting
                  ? t('studentProfile.loggingIn')
                  : t('studentProfile.loadingProfile')}
              </p>
            </div>
          </div>
        )}

        {!isBusy && showCredentialsForm && (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center max-w-md mx-auto">
              <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                <p>
                  {infoMessage ?? t('studentProfile.loginIntro')}
                </p>
              </div>
              {error && (
                <p className="text-[11px] text-destructive whitespace-pre-line">
                  {error}
                </p>
              )}
              <form
                onSubmit={handleSubmitCredentials}
                className="w-full max-w-sm mx-auto mt-1 space-y-3 text-right"
              >
                <div className="space-y-1">
                  <Label htmlFor="student-id" className="text-xs">
                    {t('studentProfile.studentId')}
                  </Label>
                  <Input
                    id="student-id"
                    dir="ltr"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="h-8 text-xs"
                    placeholder={t('studentProfile.studentIdPlaceholder')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="golestan-password" className="text-xs">
                    {t('studentProfile.password')}
                  </Label>
                  <Input
                    id="golestan-password"
                    type="password"
                    dir="ltr"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-8 text-xs"
                    placeholder={t('studentProfile.passwordPlaceholder')}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={checked =>
                        setRememberMe(Boolean(checked))
                      }
                      className="h-3 w-3"
                    />
                    <span>{t('studentProfile.rememberMe')}</span>
                  </label>
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('studentProfile.loginSubmitting') : t('studentProfile.loginButton')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!isBusy && !showCredentialsForm && error && (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center max-w-md mx-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">
                {isConnectionError
                  ? t('studentProfile.connectionErrorTitle')
                  : t('studentProfile.genericLoadError')}
              </p>
              {error && (
                <p className="text-[11px] text-muted-foreground break-words whitespace-pre-line">
                  {error}
                </p>
              )}
              <div className="flex justify-center gap-2 pt-1 w-full">
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  {t('studentProfile.retry')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowCredentialsForm(true)}
                >
                  {t('studentProfile.loginButton')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isBusy && !error && student && (
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
                  <span className="text-sm text-muted-foreground">
                    {t('studentProfile.summary.overallGpa')}
                  </span>
                  <span className="font-bold text-lg">
                    {formatGrade(overallGpa)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('studentProfile.summary.passedUnits')}
                  </span>
                  <span className="font-medium">{totalPassedUnits}</span>
                </div>
                {totalRequiredUnits && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t('studentProfile.summary.progress')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('studentProfile.summary.ofTotalUnits', {
                          total: totalRequiredUnits,
                        })}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('studentProfile.summary.bestTermGpa')}
                  </span>
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
                  <span className="text-sm font-medium">
                    {t('studentProfile.cards.gpaTitle')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formatGrade(overallGpa)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('studentProfile.cards.gpaSubtitle')}
                </div>
              </div>

              {/* Passed Units Card */}
              <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">
                    {t('studentProfile.cards.unitsTitle')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  {totalPassedUnits}
                </div>
                {totalRequiredUnits && (
                  <>
                    <Progress value={progressPercent} className="h-2 mt-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('studentProfile.cards.unitsOf', {
                        total: totalRequiredUnits,
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Best Term Card */}
              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium">
                    {t('studentProfile.cards.bestTermTitle')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-amber-600">
                  {formatGrade(bestTermGpa)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('studentProfile.cards.bestTermSubtitle')}
                </div>
              </div>
            </div>

            {/* Semesters Accordion */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                {t('studentProfile.semesters.title')}
                <span className="text-xs text-muted-foreground font-normal">
                  {t('studentProfile.semesters.subtitle')}
                </span>
              </h4>
              {sortedSemesters.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('studentProfile.semesters.empty')}
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
                            {t('studentProfile.semesters.noCourses')}
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-right py-2 px-2 text-[11px] text-muted-foreground">
                                    {t('studentProfile.semesters.table.courseName')}
                                  </th>
                                  <th className="text-center py-2 px-2 text-[11px] text-muted-foreground">
                                    {t('studentProfile.semesters.table.code')}
                                  </th>
                                  <th className="text-center py-2 px-2 text-[11px] text-muted-foreground">
                                    {t('studentProfile.semesters.table.units')}
                                  </th>
                                  <th className="text-center py-2 px-2 text-[11px] text-muted-foreground">
                                    {t('studentProfile.semesters.table.grade')}
                                  </th>
                                  <th className="text-center py-2 px-2 text-[11px] text-muted-foreground">
                                    {t('studentProfile.semesters.table.status')}
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

        {!isBusy && !error && !student && !showCredentialsForm && (
          <p className="text-sm text-muted-foreground text-center py-8">
            اطلاعاتی برای نمایش وجود ندارد.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileDialog;
