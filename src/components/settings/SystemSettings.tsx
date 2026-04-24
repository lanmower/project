import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { SystemSettings } from '@/lib/types';
import DynamicForm from './DynamicForm';

const defaultSettings: SystemSettings = {
  id: 'settings',
  emailDomains: [],
  defaultEmailCategories: ['General', 'Urgent', 'Follow-up'],
  taskCategories: ['General', 'Development', 'Support'],
  priorityLevels: [
    { id: 'low', name: 'Low', color: 'green', order: 0 },
    { id: 'medium', name: 'Medium', color: 'yellow', order: 1 },
    { id: 'high', name: 'High', color: 'red', order: 2 }
  ],
  statusTypes: [
    { id: 'new', name: 'New', color: 'blue', order: 0 },
    { id: 'in-progress', name: 'In Progress', color: 'yellow', order: 1 },
    { id: 'resolved', name: 'Resolved', color: 'green', order: 2 }
  ],
  attachmentTypes: [
    { mimeType: 'application/pdf', icon: 'file-text', allowPreview: true, maxSize: 10485760 },
    { mimeType: 'image/*', icon: 'image', allowPreview: true, maxSize: 5242880 }
  ],
  aiProviders: [
    {
      id: 'gemini',
      name: 'Google Gemini',
      enabled: true,
      config: {
        apiKey: '',
        model: 'gemini-1.5-pro',
        temperature: 0.7
      }
    }
  ],
  roles: [
    {
      id: 'user',
      name: 'User',
      permissions: ['read:own', 'write:own'],
      order: 0
    },
    {
      id: 'manager',
      name: 'Manager',
      permissions: ['read:all', 'write:own', 'manage:staff'],
      order: 1
    },
    {
      id: 'partner',
      name: 'Partner',
      permissions: ['read:all', 'write:all', 'manage:rules'],
      order: 2
    },
    {
      id: 'admin',
      name: 'Administrator',
      permissions: ['read:all', 'write:all', 'manage:all'],
      order: 3
    },
    {
      id: 'superuser',
      name: 'Superuser',
      permissions: ['*'],
      order: 4
    }
  ],
  notificationTypes: [
    {
      id: 'email-received',
      name: 'New Email',
      template: 'You have received a new email: {{subject}}',
      channels: ['email', 'push']
    }
  ],
  customFields: [],
  workflowStates: [
    {
      id: 'new',
      name: 'New',
      color: 'blue',
      order: 0,
      allowedTransitions: ['in-progress']
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      color: 'yellow',
      order: 1,
      allowedTransitions: ['resolved', 'blocked']
    },
    {
      id: 'resolved',
      name: 'Resolved',
      color: 'green',
      order: 2,
      allowedTransitions: []
    }
  ],
  dashboardLayouts: {
    user: [],
    manager: [],
    partner: [],
    admin: [],
    superuser: []
  }
};

export default function SystemSettings() {
  const { canAccessAdminSettings } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'system', 'settings'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as SystemSettings);
      }
    });

    return unsubscribe;
  }, []);

  const handleSave = async (newSettings: Partial<SystemSettings>) => {
    if (!canAccessAdminSettings()) return;

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'system', 'settings'), {
        ...settings,
        ...newSettings
      }, { merge: true });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
    setIsSaving(false);
  };

  if (!canAccessAdminSettings()) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          You don't have permission to access system settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Settings</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="customFields">Custom Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Email Configuration</h3>
            <div className="space-y-4">
              <div>
                <Label>Allowed Email Domains</Label>
                <DynamicForm
                  type="array"
                  value={settings.emailDomains}
                  onChange={(domains) => handleSave({ emailDomains: domains })}
                  itemTemplate=""
                  placeholder="Enter domain (e.g., company.com)"
                />
              </div>

              <div>
                <Label>Default Email Categories</Label>
                <DynamicForm
                  type="array"
                  value={settings.defaultEmailCategories}
                  onChange={(categories) => handleSave({ defaultEmailCategories: categories })}
                  itemTemplate=""
                  placeholder="Enter category name"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Task Configuration</h3>
            <div className="space-y-4">
              <div>
                <Label>Task Categories</Label>
                <DynamicForm
                  type="array"
                  value={settings.taskCategories}
                  onChange={(categories) => handleSave({ taskCategories: categories })}
                  itemTemplate=""
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <Label>Priority Levels</Label>
                <DynamicForm
                  type="array"
                  value={settings.priorityLevels}
                  onChange={(levels) => handleSave({ priorityLevels: levels })}
                  itemTemplate={{ id: '', name: '', color: '', order: 0 }}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Add other tab contents similarly */}
      </Tabs>
    </div>
  );
}