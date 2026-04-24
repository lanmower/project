import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useDocument<T = DocumentData>(
  path: string,
  id: string,
  transform?: (doc: DocumentData) => T
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, path, id),
      (doc) => {
        if (doc.exists()) {
          const data = {
            id: doc.id,
            ...doc.data()
          };
          setData(transform ? transform(data) : data as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error(`Error fetching ${path}/${id}:`, error);
        setError(error as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [path, id]);

  return { data, loading, error };
}