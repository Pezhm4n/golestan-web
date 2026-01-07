import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LoginAuth from '@/components/LoginAuth';
import LanguageToggle from '@/components/LanguageToggle';

const AuthPage = () => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-background via-background/95 to-background/90 dark:from-slate-950 dark:via-slate-950/98 dark:to-slate-950 flex flex-col"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Top bar with back button + language toggle */}
      <header className="w-full px-4 sm:px-6 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-sm hover:bg-accent/40 hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
        </div>
      </header>

      {/* Main content: login card + side content on large screens */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Decorative background blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div className="grid gap-10 lg:gap-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
            {/* Login card */}
            <section className="flex justify-center">
              <LoginAuth />
            </section>

            {/* Side content for larger screens */}
            <section
              className={`hidden md:flex flex-col gap-4 pr-2 ${
                isFa ? 'text-right' : 'text-left'
              }`}
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">
                  Golestoon
                </p>
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                  {t('auth.sideTitle')}
                </h2>
                <p className="mt-1 text-xs lg:text-sm text-muted-foreground leading-relaxed max-w-md">
                  {t('auth.sideBody')}
                </p>
              </div>
              <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
                <li>• {t('auth.sideBullet1')}</li>
                <li>• {t('auth.sideBullet2')}</li>
                <li>• {t('auth.sideBullet3')}</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;