import { z } from 'zod';

export const workflowStepSchema = z.object({
  id: z.string(),
  type: z.enum(['condition', 'action', 'trigger']),
  config: z.record(z.any()),
  next: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  steps: z.array(workflowStepSchema),
  isActive: z.boolean(),
  createdBy: z.string(),
  createdAt: z.date(),
  modifiedAt: z.date(),
  triggers: z.array(z.string()),
  version: z.number().default(1)
});

export type WorkflowStep = z.infer<typeof workflowStepSchema>;
export type Workflow = z.infer<typeof workflowSchema>;