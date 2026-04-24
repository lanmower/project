import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { AICriteria } from '@/lib/types';

// Update the ruleSchema to include AI criteria conditions
const ruleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  conditions: z.array(z.object({
    field: z.enum(['subject', 'body', 'from', 'to', 'sentiment', 'entities', 'categories', 'ai-criteria']),
    operator: z.enum(['contains', 'equals', 'matches', 'greater', 'less', 'includes']),
    value: z.union([z.string(), z.number(), z.array(z.string())]),
    criteriaId: z.string().optional(),
    criteriaName: z.string().optional()
  })).min(1, 'At least one condition is required'),
  actions: z.array(z.object({
    type: z.enum(['tag', 'move', 'notify', 'forward', 'todo']),
    value: z.string(),
    todoCategory: z.string().optional()
  })).min(1, 'At least one action is required'),
  isActive: z.boolean()
});

interface RuleEditorProps {
  initialRule?: Rule;
  onSave: (rule: Rule) => Promise<void>;
  onCancel: () => void;
}

export default function RuleEditor({ initialRule, onSave, onCancel }: RuleEditorProps) {
  const [conditions, setConditions] = useState(initialRule?.conditions || []);
  const [actions, setActions] = useState(initialRule?.actions || []);
  const [aiCriteria, setAiCriteria] = useState<AICriteria[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ruleSchema),
    defaultValues: initialRule || {
      name: '',
      conditions: [],
      actions: [],
      isActive: true
    }
  });

  useEffect(() => {
    const q = query(
      collection(db, 'aiCriteria'),
      where('isGlobal', '==', true)
    );

    return onSnapshot(q, (snapshot) => {
      const criteria = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as AICriteria[];
      setAiCriteria(criteria);
    });
  }, []);

  const onSubmit = async (data: any) => {
    const rule = {
      ...data,
      conditions,
      actions,
      id: initialRule?.id || crypto.randomUUID()
    };
    await onSave(rule);
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        field: 'subject',
        operator: 'contains',
        value: ''
      }
    ]);
  };

  const addAction = () => {
    setActions([
      ...actions,
      {
        type: 'tag',
        value: ''
      }
    ]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., High Priority Emails"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message as string}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Conditions</h3>
          <Button type="button" onClick={addCondition}>
            <Plus className="h-4 w-4 mr-2" /> Add Condition
          </Button>
        </div>

        {conditions.map((condition, index) => (
          <ConditionCard
            key={index}
            condition={condition}
            index={index}
            aiCriteria={aiCriteria}
            onUpdate={(index, field, value) => {
              const newConditions = [...conditions];
              newConditions[index][field] = value;
              setConditions(newConditions);
            }}
            onDelete={(index) => {
              const newConditions = [...conditions];
              newConditions.splice(index, 1);
              setConditions(newConditions);
            }}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Actions</h3>
          <Button type="button" onClick={addAction}>
            <Plus className="h-4 w-4 mr-2" /> Add Action
          </Button>
        </div>

        {actions.map((action, index) => (
          <ActionCard
            key={index}
            action={action}
            index={index}
            onUpdate={(index, field, value) => {
              const newActions = [...actions];
              newActions[index][field] = value;
              setActions(newActions);
            }}
            onDelete={(index) => {
              const newActions = [...actions];
              newActions.splice(index, 1);
              setActions(newActions);
            }}
          />
        ))}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Rule</Button>
      </div>
    </form>
  );
}
