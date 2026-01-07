import { useState, useMemo, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

type AuthMode = 'login' | 'signup';

interface AuthFormValues {
  fullName: string;
  email: string;
  password: string;
}

const initialValues: AuthFormValues = {
  fullName: '',
  email: '',
  password: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginAuth = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [mode, setMode] = useState<AuthMode>('login');
  const [values, setValues] = useState<AuthFormValues>(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const modeTitle = isSignup ? t('auth.signupTitle') : t('auth.loginTitle');
  const modeDescription = isSignup
    ? t('auth.signupDescription')
    : t('auth.loginDescription');

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
    }

    return errors;
  }, [values, isSignup, t]);

  const hasErrors = Object.keys(validate).length > 0;

  const handleChange =
    (field: keyof AuthFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues(prev => ({
        ...prev,
        [field]: event.target.value,
      }));
      setError(null);
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfoMessage(null);

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
    setValues(prev => ({
      fullName: '',
      email: prev.email,
      password: '',
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="relative overflow-hidden border border-border/70 bg-card/90 backdrop-blur-xl shadow-xl shadow-black/5">
        <div className="pointer-events-none absolute inset-x-10 -top-32 h-40 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl opacity-70" />

        <CardHeader className="relative space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1 text-right">
              <CardTitle className="text-xl sm:text-2xl font-bold">
                {modeTitle}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm leading-relaxed">
                {modeDescription}
              </CardDescription>
            </div>
            <div className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
              <User className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 inline-flex items-center rounded-full border border-border bg-muted/60 p-1 text-xs sm:text-[13px]">
            <button
              type="button"
              className={cn(
                'flex-1 px-3 py-1.5 rounded-full transition-all duration-200',
                'flex items-center justify-center gap-1.5',
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
                'flex-1 px-3 py-1.5 rounded-full transition-all duration-200',
                'flex items-center justify-center gap-1.5',
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => handleModeToggle('signup')}
            >
              <span>{t('auth.signupButton')}</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="relative pt-2 space-y-4">
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
                  {validate.fullName && (
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
                      validate.fullName &&
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
                {validate.email && (
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
                    validate.email &&
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
                {validate.password && (
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
                    validate.password &&
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

            <p className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
              {t('auth.rememberText')}
            </p>

            <Button
              type="submit"
              className="w-full mt-1 relative justify-center"
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

        <CardFooter className="relative flex flex-col items-center justify-center gap-2 pt-4 pb-5 text-[11px] sm:text-xs text-muted-foreground">
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