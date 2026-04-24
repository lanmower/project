import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface FilterConfig {
  id: string;
  label: string;
  type?: 'select' | 'text' | 'date';
  options?: { label: string; value: any }[];
}

interface FilterSectionProps {
  configs: FilterConfig[];
  filters: Record<string, any>;
  onFilterChange: (id: string, value: any) => void;
}

export function FilterSection({ configs, filters, onFilterChange }: FilterSectionProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {configs.map((config) => (
        <div key={config.id} className="flex-1 min-w-[200px]">
          {config.type === 'select' ? (
            <Select
              value={filters[config.id] || ''}
              onValueChange={(value) => onFilterChange(config.id, value)}
            >
              <option value="">All {config.label}</option>
              {config.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              placeholder={`Filter by ${config.label}`}
              value={filters[config.id] || ''}
              onChange={(e) => onFilterChange(config.id, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
