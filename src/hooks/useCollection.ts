import { useState, useEffect } from 'react';
import { collection, query, QueryConstraint, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollection<T = DocumentData>(
  path: string,
  constraints: QueryConstraint[] = [],
  transform?: (doc: DocumentData) => T
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, path), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data = {
            id: doc.id,
            ...doc.data()
          };
          return transform ? transform(data) : data;
        }) as T[];
        
        setData(items);
        setLoading(false);
      },
      (error) => {
        console.error(`Error fetching ${path}:`, error);
        setError(error as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [path, constraints.toString()]);

  return { data, loading, error };
}