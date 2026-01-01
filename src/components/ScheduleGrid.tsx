import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { DAYS, ScheduledSession } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getCourseColor, GROUP_LABELS } from '@/hooks/useCourseColors';
import CourseCell from './CourseCell';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => 7 + i);

const ScheduleGrid = () => {
  const { scheduledSessions, hoveredCourseId, allCourses } = useSchedule();
  const { showGridLines, getFontSizeClass } = useSettings();
  const [legendOpen, setLegendOpen] = useState(false);
  
  // Check if dark mode is active
  const isDark = document.documentElement.classList.contains('dark');

  // Get the hovered course's sessions for preview highlighting
  const hoveredCourse = hoveredCourseId 
    ? allCourses.find(c => c.id === hoveredCourseId) 
    : null;

  const getSessionsForSlot = (day: number, time: number): ScheduledSession[] => {
    return scheduledSessions.filter(
      session => session.day === day && session.startTime === time
    );
  };

  const isCellOccupiedByPrevious = (day: number, time: number): boolean => {
    return scheduledSessions.some(
      session => session.day === day && session.startTime < time && session.endTime > time
    );
  };

  // Check if this cell would be occupied by the hovered course
  const isHoveredCourseCell = (day: number, time: number): boolean => {
    if (!hoveredCourse) return false;
    return hoveredCourse.sessions.some(
      session => session.day === day && time >= session.startTime && time < session.endTime
    );
  };

  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:۰۰`;
  };

  const ROW_HEIGHT = 60;
  const HEADER_HEIGHT = 40;
  const TIME_COL_WIDTH = 60;

  return (
    <div data-tour="schedule-grid" className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-muted/30 p-3 relative">
      {/* Color Legend */}
      <Collapsible 
        open={legendOpen} 
        onOpenChange={setLegendOpen}
        data-tour="color-legend"
        className="absolute top-5 left-5 z-30"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1.5 text-xs bg-card/95 backdrop-blur-sm shadow-md border-border/60 hover:bg-accent"
          >
            <Palette className="h-3.5 w-3.5" />
            راهنمای رنگ‌ها
            {legendOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          <div className="bg-card/95 backdrop-blur-sm rounded-lg border border-border/60 shadow-lg p-3 space-y-2 min-w-[160px]">
            <p className="text-[10px] text-muted-foreground font-medium mb-2">دروس بر اساس نوع رنگ‌بندی شده‌اند:</p>
            
            {/* Specialized - Blue family */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: getCourseColor('demo1', 'specialized', isDark) }}
                />
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: getCourseColor('demo2', 'specialized', isDark) }}
                />
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: getCourseColor('demo3', 'specialized', isDark) }}
                />
              </div>
              <span className="text-xs text-foreground font-medium">{GROUP_LABELS.specialized}</span>
            </div>
            
            {/* General - Green family */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: getCourseColor('demo4', 'general', isDark) }}
                />
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: getCourseColor('demo5', 'general', isDark) }}
                />
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: getCourseColor('demo6', 'general', isDark) }}
                />
              </div>
              <span className="text-xs text-foreground font-medium">{GROUP_LABELS.general}</span>
            </div>
            
            {/* Basic - Warm family */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: getCourseColor('demo7', 'basic', isDark) }}
                />
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: getCourseColor('demo8', 'basic', isDark) }}
                />
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: getCourseColor('demo9', 'basic', isDark) }}
                />
              </div>
              <span className="text-xs text-foreground font-medium">{GROUP_LABELS.basic}</span>
            </div>
            
            <p className="text-[9px] text-muted-foreground pt-1 border-t border-border/50">
              هر درس رنگ یکتای خودش رو داره
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex-1 overflow-auto bg-card rounded-xl shadow-sm border border-border/50">
        <div 
          className="min-w-[800px]"
          style={{
            display: 'grid',
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(6, minmax(0, 1fr))`,
            gridTemplateRows: `${HEADER_HEIGHT}px repeat(${TIME_SLOTS.length}, ${ROW_HEIGHT}px)`,
          }}
        >
          {/* Header Row */}
          <div 
            className={cn(
              "sticky top-0 z-20 bg-muted/80 backdrop-blur-sm flex items-center justify-center",
              showGridLines ? "border border-border" : ""
            )}
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            <span className={cn("font-bold text-muted-foreground", getFontSizeClass())}>ساعت</span>
          </div>

          {DAYS.map((day, dayIndex) => (
            <div
              key={`header-${day}`}
              className={cn(
                "sticky top-0 z-20 bg-muted/80 backdrop-blur-sm flex items-center justify-center font-bold text-foreground",
                showGridLines ? "border-t border-b border-l border-border" : "",
                getFontSizeClass()
              )}
              style={{ gridColumn: dayIndex + 2, gridRow: 1 }}
            >
              {day}
            </div>
          ))}

          {/* Time Rows */}
          {TIME_SLOTS.map((time, rowIndex) => (
            <React.Fragment key={`row-${time}`}>
              <div
                className={cn(
                  "bg-muted/50 flex items-center justify-center text-muted-foreground font-mono",
                  showGridLines ? "border-l border-b border-border" : "",
                  getFontSizeClass()
                )}
                style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
              >
                {formatTime(time)}
              </div>

              {DAYS.map((_, dayIndex) => {
                const sessions = getSessionsForSlot(dayIndex, time);
                const isOccupied = isCellOccupiedByPrevious(dayIndex, time);
                const isPreviewCell = isHoveredCourseCell(dayIndex, time);

                if (isOccupied) return null;

                const mainSession = sessions[0];
                const rowSpan = mainSession ? mainSession.endTime - mainSession.startTime : 1;

                return (
                  <div
                    key={`cell-${dayIndex}-${time}`}
                    className={cn(
                      "relative transition-all duration-200",
                      showGridLines ? "border-l border-b border-border/60" : "",
                      rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                      "hover:bg-accent/30",
                      // Highlight cells where hovered course would appear
                      isPreviewCell && !mainSession && "bg-primary/15 ring-1 ring-inset ring-primary/40"
                    )}
                    style={{ 
                      gridColumn: dayIndex + 2, 
                      gridRow: rowSpan > 1 
                        ? `${rowIndex + 2} / span ${rowSpan}` 
                        : rowIndex + 2,
                    }}
                  >
                    <CourseCell sessions={sessions} />
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;
