import { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';

interface AuditEvent {
  type: string;
  action: string;
  entityId: string;
  entityType: string;
  metadata?: Record<string, any>;
}

export function useAudit() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const logEvent = useCallback(async (event: AuditEvent) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'auditLog'), {
        ...event,
        userId: user.uid,
        userEmail: user.email,
        timestamp: serverTimestamp()
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { logEvent, loading };
}