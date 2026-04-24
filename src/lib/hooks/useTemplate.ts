import { useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Template {
  id: string;
  name: string;
  content: string;
  type: 'email' | 'task' | 'response';
  variables: string[];
}

export function useTemplate() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = useCallback(async (type: Template['type']) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'templates'),
        where('type', '==', type)
      );
      const snapshot = await getDocs(q);
      setTemplates(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Template[]);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyTemplate = useCallback((template: Template, variables: Record<string, string>) => {
    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return content;
  }, []);

  return { templates, loading, loadTemplates, applyTemplate };
}