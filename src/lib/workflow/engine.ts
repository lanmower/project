import { Workflow, WorkflowStep } from '../types/workflow';
import { EventEmitter } from 'events';

export class WorkflowEngine extends EventEmitter {
  private workflows: Map<string, Workflow> = new Map();
  private stepHandlers: Map<string, (data: any, config: any) => Promise<any>> = new Map();

  constructor() {
    super();
    this.registerBuiltinHandlers();
  }

  private registerBuiltinHandlers() {
    this.registerHandler('condition.email.subject', async (data, config) => {
      return data.subject.includes(config.value);
    });

    this.registerHandler('action.create.task', async (data, config) => {
      // Implementation
    });

    // Add more built-in handlers
  }

  public registerHandler(type: string, handler: (data: any, config: any) => Promise<any>) {
    this.stepHandlers.set(type, handler);
  }

  public async executeWorkflow(workflowId: string, data: any) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.isActive) return null;

    const context = { data, results: new Map() };
    const startSteps = workflow.steps.filter(step => !step.next);

    for (const step of startSteps) {
      await this.executeStep(step, context);
    }

    return context.results;
  }

  private async executeStep(step: WorkflowStep, context: any) {
    const handler = this.stepHandlers.get(step.type);
    if (!handler) throw new Error(`No handler for step type: ${step.type}`);

    try {
      const result = await handler(context.data, step.config);
      context.results.set(step.id, result);

      if (result && step.next) {
        for (const nextStepId of step.next) {
          const nextStep = this.findStep(nextStepId);
          if (nextStep) {
            await this.executeStep(nextStep, context);
          }
        }
      }
    } catch (error) {
      this.emit('stepError', { step, error, context });
    }
  }

  private findStep(stepId: string): WorkflowStep | null {
    for (const workflow of this.workflows.values()) {
      const step = workflow.steps.find(s => s.id === stepId);
      if (step) return step;
    }
    return null;
  }
}