import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface EllipsisTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Maximum width for the text container.
   * If not provided, it will shrink within its parent using min-w-0.
   */
  maxWidthClassName?: string;
}

/**
 * Single-line text with proper ellipsis and optional tooltip.
 *
 * Features:
 * - Always renders on a single line (whitespace-nowrap).
 * - Shows CSS ellipsis when the content overflows.
 * - Detects real overflow and only shows tooltip when needed.
 * - On mobile, tooltip is opened via long-press (touch & hold).
 * - RTL-friendly by default; inherits dir or can be overridden via props.
 */
export const EllipsisText = React.forwardRef<HTMLSpanElement, EllipsisTextProps>(
  ({ className, children, maxWidthClassName, dir, ...props }, ref) => {
    const innerRef = React.useRef<HTMLSpanElement | null>(null);
    const mergedRef = React.useCallback(
      (node: HTMLSpanElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLSpanElement | null>).current = node;
        }
      },
      [ref],
    );

    const [isOverflowing, setIsOverflowing] = React.useState(false);
    const [fullText, setFullText] = React.useState<string>('');
    const [open, setOpen] = React.useState(false);
    const longPressTimeoutRef = React.useRef<number | null>(null);

    // Measure overflow based on scrollWidth / clientWidth
    React.useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      const measure = () => {
        const textContent = el.textContent ?? '';
        const overflowing = el.scrollWidth > el.clientWidth + 1; // small tolerance

        setFullText(textContent);
        setIsOverflowing(overflowing);
      };

      measure();

      const handleResize = () => {
        measure();
      };

      let resizeObserver: ResizeObserver | null = null;

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => measure());
        resizeObserver.observe(el);
      }

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }, [children]);

    const clearLongPress = () => {
      if (longPressTimeoutRef.current !== null) {
        window.clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
      // Long-press only for touch pointers (mobile / tablet)
      if (event.pointerType === 'touch') {
        clearLongPress();
        longPressTimeoutRef.current = window.setTimeout(() => {
          setOpen(true);
        }, 500);
      }
    };

    const handlePointerUp = () => {
      clearLongPress();
    };

    const handlePointerLeave = () => {
      clearLongPress();
    };

    const handleOpenChange = (nextOpen: boolean) => {
      setOpen(nextOpen);
    };

    const baseSpan = (
      <span
        ref={mergedRef}
        dir={dir}
        className={cn(
          // Single-line ellipsis baseline
          'truncate whitespace-nowrap',
          // Allow flex parents to shrink this element
          'min-w-0',
          maxWidthClassName,
          className,
        )}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        {children}
      </span>
    );

    // No tooltip if not actually overflowing or no meaningful text
    if (!isOverflowing || !fullText.trim()) {
      return baseSpan;
    }

    return (
      <Tooltip open={open} onOpenChange={handleOpenChange} delayDuration={250}>
        <TooltipTrigger asChild>{baseSpan}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs text-xs leading-relaxed text-right"
          dir={dir ?? 'rtl'}
        >
          {fullText}
        </TooltipContent>
      </Tooltip>
    );
  },
);

EllipsisText.displayName = 'EllipsisText';