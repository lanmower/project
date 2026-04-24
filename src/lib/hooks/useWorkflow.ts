import { useState, useCallback } from 'react';
import { WorkflowEngine } from '../workflow/engine';

export function useWorkflow(workflowId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const engine = new WorkflowEngine();
      const result = await engine.executeWorkflow(workflowId, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  return { execute, loading, error };
}