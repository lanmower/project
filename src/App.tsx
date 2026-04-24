import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import EmailList from '@/components/EmailList';
import RuleList from '@/components/RuleList';
import TodoList from '@/components/TodoList';
import PartnerDashboard from '@/components/PartnerDashboard';
import DeveloperTools from '@/components/DeveloperTools';
import CriteriaList from '@/components/CriteriaList';
import StaffOverview from '@/components/StaffOverview';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Mail,
  CheckSquare,
  Terminal,
  LogOut,
  Moon,
  Sun,
  Inbox,
  Brain,
  Wand2,
  Menu,
  Users,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

function App() {
  const { user, signOut, canAccessPartnerDashboard, canAccessManagerDashboard, canAccessRule, canAccessDeveloperTools } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('emails');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    ...(canAccessPartnerDashboard ? [{
      name: 'Partner Dashboard',
      value: 'dashboard',
      icon: LayoutDashboard
    }] : []),
    ...(canAccessManagerDashboard ? [{
      name: 'Staff Overview',
      value: 'staff',
      icon: Users
    }] : []),
    {
      name: 'My Emails',
      value: 'emails',
      icon: Mail
    },
    {
      name: 'My Tasks',
      value: 'todos',
      icon: CheckSquare
    },
    {
      name: 'Analytics',
      value: 'analytics',
      icon: BarChart
    },
    ...(canAccessRule ? [
      {
        name: 'Processing Rules',
        value: 'rules',
        icon: Wand2
      },
      {
        name: 'AI Criteria',
        value: 'criteria',
        icon: Brain
      }
    ] : []),
    ...(canAccessDeveloperTools ? [{
      name: 'Developer',
      value: 'developer',
      icon: Terminal
    }] : [])
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Inbox className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Inbox Guru</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Email Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => {
                setActiveTab(item.value);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors",
                activeTab === item.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Theme</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {user && (
          <div className="flex items-center justify-between">
            <span className="text-sm truncate max-w-[150px]">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex md:w-64 border-r bg-card">
            <Sidebar />
          </div>

          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card z-50 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Inbox className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-bold">Inbox Guru</h1>
            </div>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto md:overflow-hidden relative">
            <div className="h-full md:h-screen md:overflow-auto pt-16 md:pt-0">
              <Tabs value={activeTab} className="h-full">
                {canAccessPartnerDashboard && (
                  <TabsContent value="dashboard" className="m-0 p-4 md:p-6">
                    <PartnerDashboard />
                  </TabsContent>
                )}
                {canAccessManagerDashboard && (
                  <TabsContent value="staff" className="m-0 p-4 md:p-6">
                    <StaffOverview />
                  </TabsContent>
                )}
                <TabsContent value="emails" className="m-0 p-4 md:p-6">
                  <EmailList />
                </TabsContent>
                <TabsContent value="todos" className="m-0 p-4 md:p-6">
                  <TodoList />
                </TabsContent>
                {canAccessRule && (
                  <>
                    <TabsContent value="rules" className="m-0 p-4 md:p-6">
                      <RuleList />
                    </TabsContent>
                    <TabsContent value="criteria" className="m-0 p-4 md:p-6">
                      <CriteriaList />
                    </TabsContent>
                  </>
                )}
                {canAccessDeveloperTools && (
                  <TabsContent value="developer" className="m-0 p-4 md:p-6">
                    <DeveloperTools />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    </AuthGuard>
  );
}

export default App;