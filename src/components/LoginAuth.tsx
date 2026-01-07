import { useState, useMemo, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Loader2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import ForgotPassword from '@/components/ForgotPassword';

type AuthMode = 'login' | 'signup';
type AuthView = 'auth' | 'forgot';

interface AuthFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: AuthFormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

type Touched = Partial<Record<keyof AuthFormValues, boolean>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginAuth = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [mode, setMode] = useState<AuthMode>('login');
  const [view, setView] = useState<AuthView>('auth');
  const [values, setValues] = useState<AuthFormValues>(initialValues);
  const [touched, setTouched] = useState<Touched>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const validate = useMemo(() => {
    const errors: Partial<AuthFormValues> = {};

    if (!values.email.trim()) {
      errors.email = t('auth.fieldErrorEmailRequired');
    } else if (!emailRegex.test(values.email.trim())) {
      errors.email = t('auth.fieldErrorEmailInvalid');
    }

    if (!values.password || values.password.length < 6) {
      errors.password = t('auth.fieldErrorPassword');
    }

    if (isSignup) {
      if (!values.fullName.trim()) {
        errors.fullName = t('auth.fieldErrorNameRequired');
      } else if (values.fullName.trim().length < 3) {
        errors.fullName = t('auth.fieldErrorNameShort');
      }

      if (!values.confirmPassword.trim()) {
        errors.confirmPassword = t('auth.fieldErrorConfirmPasswordRequired');
      } else if (values.confirmPassword !== values.password) {
        errors.confirmPassword = t('auth.fieldErrorConfirmPasswordMismatch');
      }
    }

    return errors;
  }, [values, isSignup, t]);

  const hasErrors = Object.keys(validate).length > 0;

  const showFullNameError =
    isSignup && (submitted || touched.fullName) && !!validate.fullName;
  const showEmailError = (submitted || touched.email) && !!validate.email;
  const showPasswordError = (submitted || touched.password) && !!validate.password;
  const showConfirmPasswordError =
    isSignup && (submitted || touched.confirmPassword) && !!validate.confirmPassword;

  const handleChange =
    (field: keyof AuthFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValues(prev => ({
        ...prev,
        [field]: value,
      }));
      setTouched(prev => ({
        ...prev,
        [field]: true,
      }));
      setError(null);
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitted(true);

    if (hasErrors) {
      setError(t('auth.formErrorGeneric'));
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: values.email.trim(),
          password: values.password,
        });

        if (authError) {
          setError(authError.message || t('auth.loginFailed'));
          return;
        }

        if (data.session) {
          navigate('/');
        } else {
          setInfoMessage(t('auth.sessionMissing'));
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: values.email.trim(),
          password: values.password,
          options: {
            data: {
              full_name: values.fullName.trim(),
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message || t('auth.signupFailed'));
          return;
        }

        if (data.user && !data.session) {
          setInfoMessage(t('auth.signupConfirmEmail'));
        } else {
          setInfoMessage(t('auth.signupSuccess'));
        }

        navigate('/');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : t('auth.networkErrorFallback');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeToggle = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setError(null);
    setInfoMessage(null);
    setSubmitted(false);
    setTouched({});
    setValues(prev => ({
      fullName: '',
      email: prev.email,
      password: '',
      confirmPassword: '',
    }));
  };

  // Separate view for forgot password
  if (view === 'forgot') {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="relative overflow-hidden border border-border/70 bg-card/90 backdrop-blur-xl shadow-xl shadow-black/5">
          <div className="pointer-events-none absolute inset-x-10 -top-32 h-40 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl opacity-70" />

          <CardHeader className="relative space-y-4 flex flex-col items-center text-center pt-6 pb-4">
            <img
              src="/icons/t_600x600-removebg-preview.png"
              alt="Golestoon logo"
              className="h-16 w-16 md:h-20 md:w-20 rounded-2xl shadow-md bg-background object-contain"
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-[0.25em] uppercase text-primary/80">
                {t('auth.brandTitle')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('auth.brandSubtitle')}
              </p>
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {t('auth.forgotPasswordTitle')}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                {t('auth.forgotPasswordDescription')}
              </p>
            </div>
          </CardHeader>

          <CardContent className="relative pt-2 pb-6 px-5 space-y-4">
            <ForgotPassword onBackToLogin={() => setView('auth')} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="relative overflow-hidden border border-border/70 bg-card/90 backdrop-blur-xl shadow-xl shadow-black/5">
        <div className="pointer-events-none absolute inset-x-10 -top-32 h-40 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl opacity-70" />

        <CardHeader className="relative space-y-4 flex flex-col items-center text-center pt-6 pb-4">
          {/* Logo */}
          <img
            src="/icons/t_600x600-removebg-preview.png"
            alt="Golestoon logo"
            className="h-16 w-16 md:h-20 md:w-20 rounded-2xl shadow-md bg-background object-contain"
          />

          {/* English title + Persian subtitle */}
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-primary/80">
              {t('auth.brandTitle')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('auth.brandSubtitle')}
            </p>
          </div>

          {/* Slogan + description */}
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
              {t('auth.brandSlogan')}
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              {t('auth.brandDescription')}
            </p>
          </div>

          {/* CTA label */}
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            {t('auth.ctaLabel')}
          </p>
        </CardHeader>

        <CardContent className="relative pt-1 pb-5 px-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-[11px] sm:text-xs text-destructive">
              <AlertIcon />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {infoMessage && !error && (
            <div className="flex items-start gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-[11px] sm:text-xs text-primary">
              <AlertIcon />
              <p className="leading-relaxed">{infoMessage}</p>
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="flex items-center justify-between text-xs font-medium text-foreground"
                >
                  <span>{t('auth.nameLabel')}</span>
                  {showFullNameError && validate.fullName && (
                    <span className="text-[10px] text-destructive">
                      {validate.fullName}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="w-4 h-4" />
                  </span>
                  <Input
                    id="fullName"
                    dir={i18n.language.startsWith('fa') ? 'rtl' : 'ltr'}
                    autoComplete="name"
                    placeholder={t('auth.namePlaceholder')}
                    value={values.fullName}
                    onChange={handleChange('fullName')}
                    className={cn(
                      'pr-9 text-xs sm:text-sm',
                      showFullNameError &&
                        'border-destructive/60 focus-visible:ring-destructive',
                    )}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="flex items-center justify-between text-xs font-medium text-foreground"
              >
                <span>{t('auth.emailLabel')}</span>
                {showEmailError && validate.email && (
                  <span className="text-[10px] text-destructive">
                    {validate.email}
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </span>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={values.email}
                  onChange={handleChange('email')}
                  className={cn(
                    'pr-9 text-xs sm:text-sm',
                    showEmailError &&
                      'border-destructive/60 focus-visible:ring-destructive',
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="flex items-center justify-between text-xs font-medium text-foreground"
              >
                <span>{t('auth.passwordLabel')}</span>
                {showPasswordError && validate.password && (
                  <span className="text-[10px] text-destructive">
                    {validate.password}
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  dir="ltr"
                  placeholder={
                    isSignup
                      ? t('auth.passwordPlaceholderSignup')
                      : t('auth.passwordPlaceholderLogin')
                  }
                  value={values.password}
                  onChange={handleChange('password')}
                  className={cn(
                    'pr-9 pl-9 text-xs sm:text-sm',
                    showPasswordError &&
                      'border-destructive/60 focus-visible:ring-destructive',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
                  aria-label={
                    showPassword
                      ? t('auth.hidePasswordToggle')
                      : t('auth.showPasswordToggle')
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {isSignup && (
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="flex items-center justify-between text-xs font-medium text-foreground"
                >
                  <span>{t('auth.confirmPasswordLabel')}</span>
                  {showConfirmPasswordError && validate.confirmPassword && (
                    <span className="text-[10px] text-destructive">
                      {validate.confirmPassword}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    dir="ltr"
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    value={values.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    className={cn(
                      'pr-3 pl-9 text-xs sm:text-sm',
                      showConfirmPasswordError &&
                        'border-destructive/60 focus-visible:ring-destructive',
                    )}
                  />
                </div>
              </div>
            )}

            <div className="mt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setView('forgot')}
                className="text-[10px] sm:text-[11px] text-primary hover:underline"
              >
                {t('auth.forgotPasswordLink')}
              </button>

              <div className="inline-flex items-center rounded-full border border-border bg-muted/60 p-1 text-[10px] sm:text-[11px]">
                <button
                  type="button"
                  className={cn(
                    'flex-1 px-2 py-1 rounded-full transition-all duration-200',
                    'flex items-center justify-center gap-1',
                    mode === 'login'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => handleModeToggle('login')}
                >
                  <span>{t('auth.loginButton')}</span>
                </button>
                <button
                  type="button"
                  className={cn(
                    'flex-1 px-2 py-1 rounded-full transition-all duration-200',
                    'flex items-center justify-center gap-1',
                    mode === 'signup'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => handleModeToggle('signup')}
                >
                  <span>{t('auth.signupButton')}</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2 relative justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              <span>
                {isSignup ? t('auth.signupButton') : t('auth.loginButton')}
              </span>
            </Button>
          </form>
        </CardContent>

        <CardFooter className="relative flex flex-col items-center justify-center gap-2 pt-3 pb-5 text-[11px] sm:text-xs text-muted-foreground">
          <span>
            {isSignup ? t('auth.footerHaveAccount') : t('auth.footerNoAccount')}{' '}
            <button
              type="button"
              onClick={() => handleModeToggle(isSignup ? 'login' : 'signup')}
              className={cn(
                buttonVariants({ variant: 'link', size: 'sm' }),
                'px-0 h-auto text-xs align-baseline',
              )}
            >
              {isSignup ? t('auth.toggleToLogin') : t('auth.toggleToSignup')}
            </button>
          </span>

          <a
            href="https://t.me/golestoon_ir"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{t('auth.telegramLinkLabel')}</span>
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

const AlertIcon = () => (
  <svg
    className="mt-0.5 h-4 w-4 flex-shrink-0"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M12 2.75c-.68 0-1.3.36-1.63.95L3.3 16.21A1.87 1.87 0 0 0 5 19h14a1.87 1.87 0 0 0 1.7-2.79l-7.07-12.51a1.87 1.87 0 0 0-1.63-.95Zm0 5.25c.41 0 .75.34 .75.75v4.5a.75.75 0 0 1-1.5 0V8.75c0-.41.34-.75 .75-.75Zm0 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
      fill="currentColor"
    />
  </svg>
);

export default LoginAuth;