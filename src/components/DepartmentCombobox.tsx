import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DepartmentOption } from '@/hooks/useGolestanData';
import { useTranslation } from 'react-i18next';

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
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('department.searchPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('department.empty')}</CommandEmpty>

            {groups.map(([facultyName, deps]) => (
              <CommandGroup key={facultyName} heading={facultyName}>
                {deps.map((dept) => (
                  <CommandItem
                    key={dept.id}
                    value={`${facultyName} ${dept.name}`}
                    onSelect={() => {
                      onChange(dept.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === dept.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {dept.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DepartmentCombobox;