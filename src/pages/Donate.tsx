import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, Heart, Zap, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const COFFEETE_URL = 'https://www.coffeete.ir/pezhm4n';

const Donate = () => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const handleDonate = () => {
    window.open(COFFEETE_URL, '_blank', 'noopener,noreferrer');
  };

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;

    setPointer({
      x: relX * 40,
      y: relY * 40,
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="text-sm">{t('donate.backToApp')}</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Heart className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">
              {t('donate.headerChip')}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <div
          className="relative w-full animate-in fade-in-0 slide-in-from-bottom-6 duration-700"
          onMouseMove={handlePointerMove}
        >
          {/* Mouse-reactive background glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center transition-transform duration-700 ease-out">
            <div
              className="h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/15 to-pink-500/10 blur-3xl"
              style={{ transform: `translate3d(${pointer.x}px, ${pointer.y}px, 0)` }}
            />
          </div>

          {/* Hero Section - Emotional Hook */}
          <section className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium mb-6 animate-pulse">
              <Zap className="h-3.5 w-3.5" />
              <span>{t('donate.heroBadge')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                {t('donate.heroHeadlineLine1')}
                <br />
                {t('donate.heroHeadlineLine2')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed mb-2">
              {t('donate.heroLead')}
            </p>

            <p className="text-sm text-destructive/80 font-medium">
              {t('donate.heroWarning')}
            </p>
          </section>

          {/* Primary CTA Card */}
          <Card className="relative overflow-hidden p-6 sm:p-8 bg-card/95 backdrop-blur-2xl border border-border/60 shadow-2xl shadow-primary/10 mb-8">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute inset-x-0 -top-20 h-32 bg-gradient-to-b from-primary/10 to-transparent" />

            <div className="relative space-y-6">
              {/* CTA Button */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="group relative w-full sm:w-auto h-14 px-10 text-lg font-bold bg-gradient-to-r from-primary via-purple-600 to-primary hover:from-primary hover:via-purple-500 hover:to-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 animate-pulse"
                  style={{ animationDuration: '2s' }}
                  onClick={handleDonate}
                >
                  <Coffee className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform" />
                  <span>{t('donate.payAndSupport')}</span>
                </Button>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 text-center">
                  <Shield className="h-3.5 w-3.5" />
                  {t('donate.paymentNote')}
                </p>
              </div>

              {/* Soft Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1.5">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    {t('donate.statUsersTitle')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('donate.statUsersSubtitle')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1.5">
                    <Zap className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    {t('donate.statUptimeTitle')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('donate.statUptimeSubtitle')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1.5">
                    <Heart className="h-5 w-5 text-rose-500 fill-rose-500 animate-pulse" />
                  </div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    {t('donate.statFreeTitle')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('donate.statFreeSubtitle')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Secondary Section - Details */}
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
            {/* Where money goes */}
            <Card className="p-5 bg-muted/30 backdrop-blur-sm border border-border/40">
              <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Coffee className="h-4 w-4 text-primary" />
                {t('donate.moneyTitle')}
              </h2>
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>{t('donate.moneyLine1')}</p>
                <p>{t('donate.moneyLine2')}</p>
                <p>{t('donate.moneyLine3')}</p>
              </div>
            </Card>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('donate.badgeTransparent')}
              </span>
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] text-primary">
                {t('donate.badgeNoAds')}
              </span>
              <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                {t('donate.badgeStudentMade')}
              </span>
            </div>

            {/* Thank you footer */}
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border border-primary/20 text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('donate.thankYouLine1')}
                <br />
                <span className="inline-flex items-center gap-1.5 mt-1 font-medium text-foreground">
                  {t('donate.thankYouLine2')}
                  <Heart className="inline h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 backdrop-blur-md bg-background/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t('donate.footerLine', { year: currentYear })}
            {' '}
            <Heart className="inline h-3 w-3 text-rose-500 fill-rose-500 mx-0.5" />
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Donate;
