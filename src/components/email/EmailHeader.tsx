import { ProcessedEmail } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';

interface EmailHeaderProps {
  email: ProcessedEmail;
  onMarkReviewed: (emailId: string) => Promise<void>;
  onBack: () => void;
  showBackButton?: boolean;
}

export function EmailHeader({ 
  email, 
  onMarkReviewed, 
  onBack, 
  showBackButton 
}: EmailHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 md:px-6 border-b">
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      <h2 className="text-lg font-semibold truncate">{email.subject}</h2>
      {!email.reviewed && (
        <Button onClick={() => onMarkReviewed(email.id)}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Mark as Reviewed
        </Button>
      )}
    </div>
  );
}
