import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Globe, Lock } from 'lucide-react';
import CriteriaEditor from './CriteriaEditor';
import type { AICriteria } from '@/lib/types';

export default function CriteriaList() {
  const { user, userData } = useAuth();
  const [criteria, setCriteria] = useState<AICriteria[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<AICriteria | undefined>();

  useEffect(() => {
    if (!user) return;

    // Query for global criteria and user's personal criteria
    const q = query(
      collection(db, 'aiCriteria'),
      where('isGlobal', '==', true)
    );

    const personalQ = query(
      collection(db, 'aiCriteria'),
      where('createdBy', '==', user.email)
    );

    const unsubscribeGlobal = onSnapshot(q, (snapshot) => {
      const globalCriteria = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as AICriteria[];

      setCriteria(prev => {
        const personal = prev.filter(c => !c.isGlobal);
        return [...globalCriteria, ...personal];
      });
    });

    const unsubscribePersonal = onSnapshot(personalQ, (snapshot) => {
      const personalCriteria = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as AICriteria[];

      setCriteria(prev => {
        const global = prev.filter(c => c.isGlobal);
        return [...global, ...personalCriteria];
      });
    });

    return () => {
      unsubscribeGlobal();
      unsubscribePersonal();
    };
  }, [user]);

  const handleSaveCriteria = async (criteriaData: Partial<AICriteria>) => {
    if (!user) return;

    const id = editingCriteria?.id || crypto.randomUUID();
    const now = new Date();

    const newCriteria: AICriteria = {
      id,
      ...criteriaData,
      createdBy: editingCriteria?.createdBy || user.email!,
      createdAt: editingCriteria?.createdAt || now,
      modifiedAt: now
    } as AICriteria;

    await setDoc(doc(db, 'aiCriteria', id), newCriteria);
    setIsEditorOpen(false);
    setEditingCriteria(undefined);
  };

  const handleDeleteCriteria = async (criteria: AICriteria) => {
    if (!user) return;

    // Check if user has permission to delete
    if (criteria.protected && !['admin', 'superuser', 'partner'].includes(userData?.role || '')) {
      return;
    }

    if (!criteria.isGlobal || ['admin', 'superuser'].includes(userData?.role || '')) {
      await deleteDoc(doc(db, 'aiCriteria', criteria.id));
    }
  };

  const canEdit = (criteria: AICriteria) => {
    if (['admin', 'superuser'].includes(userData?.role || '')) return true;
    if (criteria.protected) return false;
    return criteria.createdBy === user?.email;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">AI Criteria</h2>
        <Button onClick={() => setIsEditorOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Criteria
        </Button>
      </div>

      <div className="grid gap-4">
        {criteria.map((criteria) => (
          <Card key={criteria.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{criteria.name}</h3>
                  <div className="flex gap-1">
                    {criteria.isGlobal && (
                      <Badge variant="secondary">
                        <Globe className="h-3 w-3 mr-1" />
                        Global
                      </Badge>
                    )}
                    {criteria.protected && (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        Protected
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {criteria.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created by {criteria.createdBy}
                </p>
              </div>
              
              {canEdit(criteria) && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCriteria(criteria);
                      setIsEditorOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCriteria(criteria)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-2xl">
          <CriteriaEditor
            initialCriteria={editingCriteria}
            onSave={handleSaveCriteria}
            onCancel={() => {
              setIsEditorOpen(false);
              setEditingCriteria(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}