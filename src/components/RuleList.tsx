import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Rule } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import RuleEditor from './RuleEditor';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function RuleList() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | undefined>();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'rules'), (snapshot) => {
      const rulesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Rule[];
      setRules(rulesData);
    });

    return unsubscribe;
  }, []);

  const handleSaveRule = async (rule: Rule) => {
    await setDoc(doc(db, 'rules', rule.id), rule);
    setIsEditorOpen(false);
    setEditingRule(undefined);
  };

  const handleDeleteRule = async (ruleId: string) => {
    await deleteDoc(doc(db, 'rules', ruleId));
  };

  const handleToggleRule = async (rule: Rule) => {
    await setDoc(doc(db, 'rules', rule.id), {
      ...rule,
      isActive: !rule.isActive
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Processing Rules</h2>
          <Button onClick={() => setIsEditorOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Rule
          </Button>
        </div>

        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium">{rule.name}</h3>
                  <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggleRule(rule)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingRule(rule);
                      setIsEditorOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    {rule.conditions.map((condition, index) => (
                      <Badge key={index} variant="outline">
                        {condition.field} {condition.operator} {condition.value}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {rule.actions.map((action, index) => (
                      <Badge key={index} variant="outline">
                        {action.type}: {action.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <RuleEditor
            initialRule={editingRule}
            onSave={handleSaveRule}
            onCancel={() => {
              setIsEditorOpen(false);
              setEditingRule(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}