import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProcessedEmail, TodoItem } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays } from 'date-fns';
import { Mail, CheckCircle, Clock, AlertCircle, CheckSquare } from 'lucide-react';
import EmailList from './EmailList';
import TodoList from './TodoList';

interface StaffMember {
  email: string;
  stats: {
    unreviewedEmails: number;
    reviewedEmails: number;
    pendingTasks: number;
    completedTasks: number;
    recentActivity: {
      date: string;
      emails: number;
      tasks: number;
    }[];
  };
}

export default function StaffOverview() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'emails' | 'tasks'>('emails');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    // Get all staff members (users with role 'user')
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'user')
    );

    const unsubscribeUsers = onSnapshot(usersQuery, async (snapshot) => {
      const staffEmails = snapshot.docs.map(doc => doc.data().email);
      
      // For each staff member, get their stats
      const staffStats = await Promise.all(staffEmails.map(async (email) => {
        const emailsQuery = query(
          collection(db, 'processedEmails'),
          where('to', 'array-contains', email),
          orderBy('timestamp', 'desc')
        );

        const todosQuery = query(
          collection(db, 'todos'),
          where('assignedTo', '==', email),
          orderBy('createdAt', 'desc')
        );

        // Get last 7 days of activity
        const sevenDaysAgo = subDays(new Date(), 7);
        const recentActivity = Array.from({ length: 7 }, (_, i) => {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
          return { date, emails: 0, tasks: 0 };
        }).reverse();

        return new Promise<StaffMember>((resolve) => {
          const unsubEmails = onSnapshot(emailsQuery, (emailsSnapshot) => {
            const unsubTodos = onSnapshot(todosQuery, (todosSnapshot) => {
              const emails = emailsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as ProcessedEmail[];

              const todos = todosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as TodoItem[];

              // Update recent activity
              emails.forEach(email => {
                const date = format(new Date(email.timestamp), 'yyyy-MM-dd');
                const activityDay = recentActivity.find(day => day.date === date);
                if (activityDay) activityDay.emails++;
              });

              todos.forEach(todo => {
                if (todo.completedAt) {
                  const date = format(new Date(todo.completedAt), 'yyyy-MM-dd');
                  const activityDay = recentActivity.find(day => day.date === date);
                  if (activityDay) activityDay.tasks++;
                }
              });

              resolve({
                email,
                stats: {
                  unreviewedEmails: emails.filter(e => !e.reviewed).length,
                  reviewedEmails: emails.filter(e => e.reviewed).length,
                  pendingTasks: todos.filter(t => !t.completed).length,
                  completedTasks: todos.filter(t => t.completed).length,
                  recentActivity
                }
              });
            });
          });
        });
      }));

      setStaffMembers(staffStats);
    });

    return () => {
      unsubscribeUsers();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Staff Overview</h2>
      </div>

      <div className="grid gap-6">
        {staffMembers.map((staff) => (
          <Card key={staff.email} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{staff.email}</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <Mail className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unreviewed</p>
                      <p className="text-xl font-bold">{staff.stats.unreviewedEmails}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reviewed</p>
                      <p className="text-xl font-bold">{staff.stats.reviewedEmails}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <CheckSquare className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Tasks</p>
                      <p className="text-xl font-bold">{staff.stats.pendingTasks}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-500/10">
                      <Clock className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Tasks</p>
                      <p className="text-xl font-bold">{staff.stats.completedTasks}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedStaff(staff.email);
                    setViewType('emails');
                  }}
                  className="text-primary hover:underline text-sm"
                >
                  View Emails
                </button>
                <button
                  onClick={() => {
                    setSelectedStaff(staff.email);
                    setViewType('tasks');
                  }}
                  className="text-primary hover:underline text-sm"
                >
                  View Tasks
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as typeof viewType)}>
            <TabsList>
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="emails">
              <EmailList staffEmail={selectedStaff!} readOnly />
            </TabsContent>
            <TabsContent value="tasks">
              <TodoList staffEmail={selectedStaff!} readOnly />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}