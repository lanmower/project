import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export type FieldType = 
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'date';

interface FormFieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => boolean | string;
  };
  options?: { label: string; value: string | number }[];
  defaultValue?: any;
}

interface DynamicFormProps {
  fields: FormFieldDefinition[];
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
}

const generateZodSchema = (fields: FormFieldDefinition[]) => {
  const schemaObject: Record<string, any> = {};

  fields.forEach((field) => {
    let fieldSchema: any = z.any();

    switch (field.type) {
      case 'text':
      case 'textarea':
        fieldSchema = z.string();
        if (field.validation?.minLength) fieldSchema = fieldSchema.min(field.validation.minLength);
        if (field.validation?.maxLength) fieldSchema = fieldSchema.max(field.validation.maxLength);
        if (field.validation?.pattern) fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern));
        break;
      case 'email':
        fieldSchema = z.string().email();
        break;
      case 'number':
        fieldSchema = z.number();
        if (field.validation?.min) fieldSchema = fieldSchema.min(field.validation.min);
        if (field.validation?.max) fieldSchema = fieldSchema.max(field.validation.max);
        break;
      case 'checkbox':
        fieldSchema = z.boolean();
        break;
      case 'date':
        fieldSchema = z.date();
        break;
    }

    if (field.required) {
      schemaObject[field.name] = fieldSchema;
    } else {
      schemaObject[field.name] = fieldSchema.optional();
    }
  });

  return z.object(schemaObject);
};

const renderFormField = (field: FormFieldDefinition) => {
  switch (field.type) {
    case 'textarea':
      return <Textarea placeholder={field.placeholder} />;
    case 'select':
      return (
        <Select>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    case 'checkbox':
      return <Checkbox />;
    default:
      return (
        <Input
          type={field.type}
          placeholder={field.placeholder}
        />
      );
  }
};

export function DynamicForm({
  fields,
  onSubmit,
  defaultValues = {}
}: DynamicFormProps) {
  const schema = generateZodSchema(fields);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {React.cloneElement(renderFormField(field), {
                    ...formField,
                    value: formField.value ?? '',
                  })}
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
