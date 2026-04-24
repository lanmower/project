import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Inbox className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <div className="h-6 w-32 bg-muted rounded mx-auto" />
            <div className="h-4 w-48 bg-muted rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-full max-w-sm p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Inbox className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Inbox Guru</h1>
            <p className="text-muted-foreground">
              AI-powered email management for teams
            </p>
          </div>
          
          <Button onClick={signIn} className="w-full" size="lg">
            Continue with Google
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}