import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TourStep {
  target: string;
  titleKey: string;
  contentKey: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: 'header',
    titleKey: 'guidedTour.steps.0.title',
    contentKey: 'guidedTour.steps.0.content',
    position: 'bottom',
  },
  {
    target: '[data-tour="sidebar"]',
    titleKey: 'guidedTour.steps.1.title',
    contentKey: 'guidedTour.steps.1.content',
    position: 'right',
  },
  {
    target: '[data-tour="available-courses"]',
    titleKey: 'guidedTour.steps.2.title',
    contentKey: 'guidedTour.steps.2.content',
    position: 'right',
  },
  {
    target: '[data-tour="unavailable-courses"]',
    titleKey: 'guidedTour.steps.3.title',
    contentKey: 'guidedTour.steps.3.content',
    position: 'right',
  },
  {
    target: '[data-tour="filters"]',
    titleKey: 'guidedTour.steps.4.title',
    contentKey: 'guidedTour.steps.4.content',
    position: 'right',
  },
  {
    target: '[data-tour="schedule-grid"]',
    titleKey: 'guidedTour.steps.5.title',
    contentKey: 'guidedTour.steps.5.content',
    position: 'left',
  },
  {
    target: '[data-tour="schedule-grid"]',
    titleKey: 'guidedTour.steps.6.title',
    contentKey: 'guidedTour.steps.6.content',
    position: 'left',
  },
  {
    target: '[data-tour="download-image"]',
    titleKey: 'guidedTour.steps.7.title',
    contentKey: 'guidedTour.steps.7.content',
    position: 'bottom',
  },
  {
    target: '[data-tour="actions"]',
    titleKey: 'guidedTour.steps.8.title',
    contentKey: 'guidedTour.steps.8.content',
    position: 'top',
  },
  {
    target: '[data-tour="exam-schedule"]',
    titleKey: 'guidedTour.steps.9.title',
    contentKey: 'guidedTour.steps.9.content',
    position: 'bottom',
  },
  {
    target: '[data-tour="saved-schedules"]',
    titleKey: 'guidedTour.steps.10.title',
    contentKey: 'guidedTour.steps.10.content',
    position: 'bottom',
  },
  {
    target: '[data-tour="profile"]',
    titleKey: 'guidedTour.steps.11.title',
    contentKey: 'guidedTour.steps.11.content',
    position: 'bottom',
  },
  {
    target: 'footer',
    titleKey: 'guidedTour.steps.12.title',
    contentKey: 'guidedTour.steps.12.content',
    position: 'top',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidedTour = ({ isOpen, onClose }: GuidedTourProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 340, height: 220 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = tooltipRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setTooltipSize({ width: Math.ceil(rect.width), height: Math.ceil(rect.height) });
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);

    return () => ro.disconnect();
  }, [isOpen, currentStep]);

  const updateTargetRect = useCallback(() => {
    if (!isOpen) return;
    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setTargetRect(null);
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateTargetRect, 100);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isOpen, currentStep, updateTargetRect]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentStep, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handlePrev();
      if (e.key === 'ArrowLeft') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !mounted) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const getTooltipPosition = () => {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const gap = 28;
    const margin = 24;
    const tooltipWidth = tooltipSize.width;
    const tooltipHeight = tooltipSize.height;

    const opposite = (pos: TourStep['position']): TourStep['position'] => {
      switch (pos) {
        case 'top':
          return 'bottom';
        case 'bottom':
          return 'top';
        case 'left':
          return 'right';
        case 'right':
          return 'left';
      }
    };

    const canPlace = (pos: TourStep['position']) => {
      switch (pos) {
        case 'right':
          return targetRect.right + gap + tooltipWidth <= window.innerWidth - margin;
        case 'left':
          return targetRect.left - gap - tooltipWidth >= margin;
        case 'bottom':
          return targetRect.bottom + gap + tooltipHeight <= window.innerHeight - margin;
        case 'top':
          return targetRect.top - gap - tooltipHeight >= margin;
      }
    };

    const uniqueCandidates = Array.from(
      new Set<TourStep['position']>([
        step.position,
        opposite(step.position),
        'bottom',
        'top',
        'right',
        'left',
      ])
    );

    const placement = uniqueCandidates.find(canPlace) ?? step.position;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = targetRect.top - tooltipHeight - gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));
        break;
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));
        left = targetRect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));
        left = targetRect.right + gap;
        break;
    }

    // Absolute fallback (very small viewport)
    if (
      Number.isNaN(top) ||
      Number.isNaN(left) ||
      top < margin ||
      left < margin ||
      left + tooltipWidth > window.innerWidth - margin ||
      top + tooltipHeight > window.innerHeight - margin
    ) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    return { top: `${top}px`, left: `${left}px` };
  };

  const tourContent = (
    <div className="fixed inset-0 z-[9999]" dir="rtl">
      {/* Overlay (spotlight) */}
      {targetRect ? (
        <>
          {/* Top */}
          <div
            className="absolute left-0 top-0 w-full bg-background/30 backdrop-blur-[1px] backdrop-brightness-75 transition-all duration-300"
            style={{ height: Math.max(0, targetRect.top - 8) }}
            onClick={onClose}
          />
          {/* Bottom */}
          <div
            className="absolute left-0 w-full bg-background/30 backdrop-blur-[1px] backdrop-brightness-75 transition-all duration-300"
            style={{
              top: targetRect.bottom + 8,
              height: Math.max(0, window.innerHeight - (targetRect.bottom + 8)),
            }}
            onClick={onClose}
          />
          {/* Left */}
          <div
            className="absolute left-0 bg-background/30 backdrop-blur-[1px] backdrop-brightness-75 transition-all duration-300"
            style={{
              top: targetRect.top - 8,
              width: Math.max(0, targetRect.left - 8),
              height: targetRect.height + 16,
            }}
            onClick={onClose}
          />
          {/* Right */}
          <div
            className="absolute bg-background/30 backdrop-blur-[1px] backdrop-brightness-75 transition-all duration-300"
            style={{
              top: targetRect.top - 8,
              left: targetRect.right + 8,
              width: Math.max(0, window.innerWidth - (targetRect.right + 8)),
              height: targetRect.height + 16,
            }}
            onClick={onClose}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 bg-background/30 backdrop-blur-[1px] backdrop-brightness-75 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Highlight around target */}
      {targetRect && (
        <div
          className="absolute pointer-events-none border-2 border-primary rounded-xl transition-all duration-300 ease-out animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow:
              '0 0 20px hsl(var(--primary) / 0.45), inset 0 0 20px hsl(var(--primary) / 0.08)',
            zIndex: 2,
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        className="absolute w-[340px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out animate-fade-in"
        style={{
          ...getTooltipPosition(),
          zIndex: 10,
        }}
      >
        {/* Progress bar */}
        <div className="h-1.5 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">
                {t('guidedTour.stepLabel', {
                  current: currentStep + 1,
                  total: tourSteps.length,
                })}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold mb-2 text-foreground">
            {t(step.titleKey)}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 whitespace-pre-line">
            {t(step.contentKey)}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              {t('guidedTour.skip')}
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="h-9 gap-1.5 px-3"
                >
                  <ChevronRight className="h-4 w-4" />
                  {t('guidedTour.previous')}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="h-9 gap-1.5 px-4"
              >
                {currentStep === tourSteps.length - 1
                  ? t('guidedTour.finish')
                  : t('guidedTour.next')}
                {currentStep < tourSteps.length - 1 && (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 pb-4">
          {tourSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === currentStep
                  ? "bg-primary w-8"
                  : idx < currentStep
                    ? "bg-primary/50 w-2"
                    : "bg-muted-foreground/30 w-2"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(tourContent, document.body);
};

export default GuidedTour;
