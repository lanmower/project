import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import type { AICriteria } from '@/lib/types';

const criteriaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  expectedFormat: z.string().min(1, 'Expected format is required'),
  isGlobal: z.boolean(),
  protected: z.boolean()
});

interface CriteriaEditorProps {
  initialCriteria?: AICriteria;
  onSave: (criteria: Partial<AICriteria>) => Promise<void>;
  onCancel: () => void;
}

export default function CriteriaEditor({ initialCriteria, onSave, onCancel }: CriteriaEditorProps) {
  const { userData } = useAuth();
  const canMakeProtected = userData?.role === 'admin' || userData?.role === 'superuser' || userData?.role === 'partner';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(criteriaSchema),
    defaultValues: initialCriteria || {
      name: '',
      description: '',
      prompt: '',
      expectedFormat: '',
      isGlobal: false,
      protected: false
    }
  });

  const onSubmit = async (data: any) => {
    await onSave({
      ...data,
      protected: canMakeProtected ? data.protected : false
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., Customer Sentiment Analysis"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message as string}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Explain what this criteria checks for..."
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message as string}</p>
          )}
        </div>

        <div>
          <Label htmlFor="prompt">AI Prompt</Label>
          <Textarea
            id="prompt"
            {...register('prompt')}
            placeholder="Prompt for the AI to analyze..."
          />
          {errors.prompt && (
            <p className="text-sm text-destructive">{errors.prompt.message as string}</p>
          )}
        </div>

        <div>
          <Label htmlFor="expectedFormat">Expected Response Format</Label>
          <Input
            id="expectedFormat"
            {...register('expectedFormat')}
            placeholder="e.g., JSON with score (0-1) and reason"
          />
          {errors.expectedFormat && (
            <p className="text-sm text-destructive">{errors.expectedFormat.message as string}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch {...register('isGlobal')} />
            <Label>Make available to all users</Label>
          </div>

          {canMakeProtected && (
            <div className="flex items-center space-x-2">
              <Switch {...register('protected')} />
              <Label>Protect from user modifications</Label>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Criteria</Button>
      </div>
    </form>
  );
}