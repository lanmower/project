import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface DynamicFormProps {
  type: 'array' | 'object';
  value: any;
  onChange: (value: any) => void;
  itemTemplate: any;
  placeholder?: string;
}

export default function DynamicForm({
  type,
  value,
  onChange,
  itemTemplate,
  placeholder
}: DynamicFormProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (type === 'array') {
      onChange([...value, itemTemplate]);
    }
  };

  const handleRemove = (index: number) => {
    if (type === 'array') {
      const newValue = [...value];
      newValue.splice(index, 1);
      onChange(newValue);
    }
  };

  const handleChange = (index: number, field: string, newValue: any) => {
    if (type === 'array') {
      const newArray = [...value];
      if (typeof itemTemplate === 'object') {
        newArray[index] = { ...newArray[index], [field]: newValue };
      } else {
        newArray[index] = newValue;
      }
      onChange(newArray);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newValue = [...value];
    const draggedItem = newValue[draggedIndex];
    newValue.splice(draggedIndex, 1);
    newValue.splice(index, 0, draggedItem);
    onChange(newValue);
    setDraggedIndex(index);
  };

  return (
    <div className="space-y-2">
      {type === 'array' && Array.isArray(value) && (
        <div className="space-y-2">
          {value.map((item, index) => (
            <Card
              key={index}
              className="p-2 flex items-center gap-2"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
            >
              <button
                className="cursor-move p-1 hover:bg-muted rounded"
                onMouseDown={(e) => e.preventDefault()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>

              {typeof itemTemplate === 'object' ? (
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {Object.keys(itemTemplate).map((field) => (
                    <Input
                      key={field}
                      value={item[field]}
                      onChange={(e) => handleChange(index, field, e.target.value)}
                      placeholder={`Enter ${field}`}
                    />
                  ))}
                </div>
              ) : (
                <Input
                  className="flex-1"
                  value={item}
                  onChange={(e) => handleChange(index, '', e.target.value)}
                  placeholder={placeholder}
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={handleAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
}