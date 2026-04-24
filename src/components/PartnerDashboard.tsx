import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProcessedEmail } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import EmailList from './EmailList';

export default function PartnerDashboard() {
  const [stats, setStats] = useState({
    totalUnreviewed: 0,
    totalReviewed: 0,
    recentlyResolved: 0,
    staffStats: [] as Array<{
      email: string;
      unreviewed: number;
      reviewed: number;
      recent: number;
    }>,
    dailyStats: [] as Array<{
      date: string;
      reviewed: number;
      unreviewed: number;
    }>
  });
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'staff' | 'timeline'>('overview');

  useEffect(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    
    // Listen for all emails
    const q = query(
      collection(db, 'processedEmails'),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const emails = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProcessedEmail[];

      // Calculate stats
      const staffEmails = new Map<string, ProcessedEmail[]>();
      emails.forEach(email => {
        const staff = email.to[0];
        if (!staffEmails.has(staff)) {
          staffEmails.set(staff, []);
        }
        staffEmails.get(staff)!.push(email);
      });

      const staffStats = Array.from(staffEmails.entries()).map(([email, staffEmails]) => ({
        email,
        unreviewed: staffEmails.filter(e => !e.reviewed).length,
        reviewed: staffEmails.filter(e => e.reviewed).length,
        recent: staffEmails.filter(e => 
          e.reviewed && 
          new Date(e.reviewedAt!) >= sevenDaysAgo
        ).length
      }));

      // Calculate daily stats for the last 7 days
      const dailyStats = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'MMM dd');
        const dayEmails = emails.filter(email => 
          format(new Date(email.timestamp), 'yyyy-MM-dd') === 
          format(date, 'yyyy-MM-dd')
        );

        return {
          date: dateStr,
          reviewed: dayEmails.filter(e => e.reviewed).length,
          unreviewed: dayEmails.filter(e => !e.reviewed).length
        };
      }).reverse();

      setStats({
        totalUnreviewed: emails.filter(e => !e.reviewed).length,
        totalReviewed: emails.filter(e => e.reviewed).length,
        recentlyResolved: emails.filter(e => 
          e.reviewed && 
          new Date(e.reviewedAt!) >= sevenDaysAgo
        ).length,
        staffStats,
        dailyStats
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Partner Dashboard</h2>
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="overview" className="mt-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Mail className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unreviewed Emails</p>
                <p className="text-2xl font-bold">{stats.totalUnreviewed}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviewed</p>
                <p className="text-2xl font-bold">{stats.totalReviewed}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recently Resolved</p>
                <p className="text-2xl font-bold">{stats.recentlyResolved}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold mb-4">7-Day Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.dailyStats}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reviewed" name="Reviewed" fill="hsl(var(--chart-1))" />
              <Bar dataKey="unreviewed" name="Unreviewed" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </TabsContent>

      <TabsContent value="staff" className="mt-6">
        <div className="grid gap-4">
          {stats.staffStats.map((staff) => (
            <Card key={staff.email} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{staff.email}</h3>
                  <div className="flex gap-4 mt-2">
                    <p className="text-sm text-muted-foreground">
                      Unreviewed: <span className="font-medium">{staff.unreviewed}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reviewed: <span className="font-medium">{staff.reviewed}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Recent: <span className="font-medium">{staff.recent}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStaff(staff.email)}
                  className="text-primary hover:underline text-sm"
                >
                  View Details
                </button>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="timeline" className="mt-6">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4">
            {stats.staffStats.map((staff) => (
              <div key={staff.email}>
                <h3 className="font-medium mb-2">{staff.email}</h3>
                <div className="grid gap-2">
                  {staff.unreviewed > 0 && (
                    <Card className="p-4 border-l-4 border-l-yellow-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <p>{staff.unreviewed} unreviewed emails</p>
                        </div>
                        <button
                          onClick={() => setSelectedStaff(staff.email)}
                          className="text-primary hover:underline text-sm"
                        >
                          View
                        </button>
                      </div>
                    </Card>
                  )}
                  {staff.recent > 0 && (
                    <Card className="p-4 border-l-4 border-l-green-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <p>{staff.recent} emails resolved this week</p>
                        </div>
                        <button
                          onClick={() => setSelectedStaff(staff.email)}
                          className="text-primary hover:underline text-sm"
                        >
                          View
                        </button>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <EmailList staffEmail={selectedStaff!} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEmailId} onOpenChange={() => setSelectedEmailId(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <EmailList initialEmailId={selectedEmailId!} />
        </DialogContent>
      </Dialog>
    </div>
  );
}