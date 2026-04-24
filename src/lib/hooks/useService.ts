import { useState, useEffect } from 'react';
import { BaseService } from '../services/BaseService';
import { QueryConstraint } from 'firebase/firestore';

export function useService<T extends { id: string }>(
  service: BaseService<T>,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = service.subscribe((items) => {
        setData(items);
        setLoading(false);
      }, constraints);

      return unsubscribe;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [service, constraints.toString()]);

  return { data, loading, error };
}