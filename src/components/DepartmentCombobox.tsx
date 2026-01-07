import { useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { DepartmentOption } from '@/hooks/useGolestanData';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/use-responsive';

interface DepartmentComboboxProps {
  value: string | 'all' | null;
  onChange: (value: string | 'all' | null) => void;
  departments: DepartmentOption[];
  placeholder?: string;
}

/**
 * Department selection combobox using shadcn Command + Popover.
 * Faculties are rendered as group headers with departments as items.
 */
const DepartmentCombobox = ({
  value,
  onChange,
  departments,
  placeholder,
}: DepartmentComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  const groups = useMemo(() => {
    const map = new Map<string, DepartmentOption[]>();
    for (const dept of departments) {
      const list = map.get(dept.faculty);
      if (list) list.push(dept);
      else map.set(dept.faculty, [dept]);
    }
    return Array.from(map.entries());
  }, [departments]);

  const selectedDept =
    value === 'all' || value === null
      ? undefined
      : departments.find((d) => d.id === value);

  const effectivePlaceholder = placeholder ?? t('department.placeholder');

  const buttonLabel =
    value === 'all' || !selectedDept
      ? effectivePlaceholder
      : `${selectedDept.faculty} - ${selectedDept.name}`;

  // Mobile: use full-screen/bottom sheet for better scrolling UX
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 text-xs font-medium border-b-0 rounded-b-none"
          >
            <span className={cn('truncate', !selectedDept && 'text-muted-foreground')}>
              {buttonLabel}
            </span>
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh] p-4" dir="rtl">
          <SheetHeader>
            <SheetTitle className="text-sm font-semibold">
              {t('department.placeholder')}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <Command>
              <CommandInput
                placeholder={t('department.searchPlaceholder')}
                className="h-9 text-xs"
              />
              <CommandList
                className="mt-2 max-h-[50vh] overflow-y-auto overscroll-contain"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  overscrollBehavior: 'contain',
                }}
              >
                {groups.length === 0 ? (
                  <CommandEmpty>{t('department.empty')}</CommandEmpty>
                ) : (
                  groups.map(([faculty, deps]) => (
                    <CommandGroup key={faculty} heading={faculty}>
                      {deps.map(dep => (
                        <CommandItem
                          key={dep.id}
                          value={`${dep.name} ${dep.code}`}
                          onSelect={() => {
                            onChange(dep.id);
                            setOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">{dep.name}</span>
                            {dep.code && (
                              <span className="text-[10px] text-muted-foreground">
                                {dep.code}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))
                )}
              </CommandList>
            </Command>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop / tablet: keep popover combobox
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 text-xs font-medium border-b-0 rounded-b-none"
        >
          <span className={cn('truncate', !selectedDept && 'text-muted-foreground')}>
            {buttonLabel}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 z-50 pointer-events-auto" align="start">
        <Command>
          <CommandInput
            placeholder={t('department.searchPlaceholder')}
            className="h-8 text-xs"
          />
          <CommandList
            className="max-h-[300px] overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain pointer-events-auto"
            style={{
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain',
            }}
          >
            {groups.length === 0 ? (
              <CommandEmpty>{t('department.empty')}</CommandEmpty>
            ) : (
              groups.map(([faculty, deps]) => (
                <CommandGroup key={faculty} heading={faculty}>
                  {deps.map(dep => (
                    <CommandItem
                      key={dep.id}
                      value={`${dep.name} ${dep.code}`}
                      onSelect={() => {
                        onChange(dep.id);
                        setOpen(false);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{dep.name}</span>
                        {dep.code && (
                          <span className="text-[10px] text-muted-foreground">
                            {dep.code}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DepartmentCombobox;