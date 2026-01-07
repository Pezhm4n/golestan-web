import { FormEvent, useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword = ({ onBackToLogin }: ForgotPasswordProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError(t('auth.fieldErrorEmailRequired'));
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setError(t('auth.fieldErrorEmailInvalid'));
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo: `${window.location.origin}/auth`,
        },
      );

      if (resetError) {
        setError(resetError.message || t('auth.networkErrorFallback'));
        return;
      }

      setInfo(t('auth.forgotPasswordSuccess'));
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

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="forgotEmail"
          className="flex items-center justify-between text-xs font-medium text-foreground"
        >
          <span>{t('auth.emailLabel')}</span>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Mail className="w-4 h-4" />
          </span>
          <Input
            id="forgotEmail"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="text-[11px] sm:text-xs text-destructive leading-relaxed">
          {error}
        </p>
      )}

      {info && (
        <div className="space-y-1.5 text-[11px] sm:text-xs leading-relaxed">
          <p className="text-foreground">{info}</p>
          <p className="text-muted-foreground">
            {t('auth.forgotPasswordSpamNote')}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          <span>{t('auth.forgotPasswordSubmit')}</span>
        </Button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full text-center text-[11px] sm:text-xs text-primary hover:underline mt-1"
        >
          {t('auth.forgotPasswordBackToLogin')}
        </button>
      </div>
    </form>
  );
};

export default ForgotPassword;