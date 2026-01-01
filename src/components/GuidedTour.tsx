import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: 'header',
    title: '👋 خوش آمدید!',
    content: 'این برنامه‌ریز هوشمند انتخاب واحد گلستان هست. بیا با هم یه دوری بزنیم!',
    position: 'bottom',
  },
  {
    target: '[data-tour="sidebar"]',
    title: '📚 لیست دروس',
    content: 'اینجا همه دروس رو می‌بینی. رشته‌ت رو انتخاب کن و روی هر درس کلیک کن تا به برنامه اضافه بشه.',
    position: 'right',
  },
  {
    target: '[data-tour="filters"]',
    title: '🔍 فیلترها',
    content: 'با این فیلترها می‌تونی دروس رو بر اساس زمان، جنسیت و نوع درس فیلتر کنی.',
    position: 'right',
  },
  {
    target: '[data-tour="schedule-grid"]',
    title: '📅 جدول برنامه',
    content: 'وقتی درسی رو انتخاب کنی، اینجا توی جدول نمایش داده میشه. تداخل‌ها خودکار تشخیص داده میشن!',
    position: 'left',
  },
  {
    target: '[data-tour="actions"]',
    title: '💾 ذخیره و مدیریت',
    content: 'از اینجا می‌تونی برنامه‌ت رو ذخیره کنی، درس جدید اضافه کنی یا همه رو پاک کنی.',
    position: 'top',
  },
  {
    target: '[data-tour="exam-schedule"]',
    title: '📝 جدول امتحانات',
    content: 'تاریخ امتحانات دروس انتخابی‌ت رو اینجا ببین و اگه تداخل داشت خبردار شو!',
    position: 'bottom',
  },
  {
    target: '[data-tour="saved-schedules"]',
    title: '📁 برنامه‌های ذخیره شده',
    content: 'برنامه‌های مختلف رو ذخیره کن و هر وقت خواستی بینشون سوییچ کن.',
    position: 'bottom',
  },
  {
    target: 'footer',
    title: '📊 خلاصه وضعیت',
    content: 'تعداد واحد، دروس انتخابی و وضعیت تداخل رو همیشه اینجا ببین. حالا برو و بهترین برنامه رو بچین! 🎯',
    position: 'top',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidedTour = ({ isOpen, onClose }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const updateTargetRect = useCallback(() => {
    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    setIsAnimating(true);
    const timer = setTimeout(() => {
      updateTargetRect();
      setIsAnimating(false);
    }, 150);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [isOpen, currentStep, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true);
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') handlePrev();
    if (e.key === 'ArrowLeft') handleNext();
  }, [isOpen, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
    }

    // Keep tooltip in viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

    return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <div className="fixed inset-0 z-[100]" dir="rtl">
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="12"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Highlight border around target */}
      {targetRect && (
        <div
          className={cn(
            "absolute border-2 border-primary rounded-xl pointer-events-none transition-all duration-300 ease-out",
            "shadow-[0_0_0_4px_rgba(var(--primary),0.2),0_0_30px_rgba(var(--primary),0.3)]",
            isAnimating && "opacity-0 scale-95"
          )}
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        >
          {/* Animated pulse ring */}
          <div className="absolute inset-0 rounded-xl border-2 border-primary animate-ping opacity-50" />
        </div>
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out",
          isAnimating && "opacity-0 scale-95 translate-y-2"
        )}
        style={getTooltipStyle()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} از {tourSteps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {step.content}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              رد کردن
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="h-8 gap-1"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  قبلی
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="h-8 gap-1"
              >
                {currentStep === tourSteps.length - 1 ? 'پایان' : 'بعدی'}
                {currentStep < tourSteps.length - 1 && (
                  <ChevronLeft className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-4">
          {tourSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAnimating(true);
                setCurrentStep(idx);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                idx === currentStep
                  ? "bg-primary w-6"
                  : idx < currentStep
                    ? "bg-primary/50"
                    : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
