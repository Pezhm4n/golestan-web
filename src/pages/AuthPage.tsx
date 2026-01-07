import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LoginAuth from '@/components/LoginAuth';

const AuthPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background via-background/95 to-background/90 dark:from-slate-950 dark:via-slate-950/98 dark:to-slate-950 flex flex-col">
      {/* Top bar with back button */}
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
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Decorative background blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
            {/* Left: brand / description */}
            <section className="hidden md:flex flex-col gap-4 text-right pr-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80 mb-1">
                  Golestoon
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  دستیار هوشمند برنامه‌ریزی دروس
                </h1>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
                  حساب کاربری گلستون به شما کمک می‌کند برنامه هفتگی، تداخل کلاس‌ها و وضعیت
                  درسی‌تان را روی یک صفحه، مرتب و قابل فهم ببینید.
                </p>
              </div>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li>• ذخیره و مقایسه سناریوهای مختلف انتخاب واحد</li>
                <li>• نمایش تداخل‌های کلاس و امتحان به صورت بصری</li>
                <li>• همگام‌سازی بین دستگاه‌ها با استفاده از Supabase</li>
              </ul>
            </section>

            {/* Right: auth card */}
            <section className="flex justify-center">
              <LoginAuth />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;