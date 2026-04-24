import { ProcessedEmail } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Paperclip, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EmailListItemProps {
  email: ProcessedEmail;
  isSelected: boolean;
  onClick: () => void;
  priorityColors: Record<string, string>;
}

export function EmailListItem({ email, isSelected, onClick, priorityColors }: EmailListItemProps) {
  return (
    <Card
      className={cn(
        "p-3 cursor-pointer transition-colors",
        isSelected ? "bg-muted" : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium line-clamp-1">{email.subject}</p>
            {email.attachments.length > 0 && (
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            From: {email.from}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{format(new Date(email.timestamp), 'PP')}</span>
            <Badge
              variant="secondary"
              className={cn('ml-2', priorityColors[email.priority])}
            >
              {email.priority}
            </Badge>
          </div>
        </div>
        {!email.reviewed && (
          <div className="text-yellow-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
        )}
      </div>
    </Card>
  );
}
