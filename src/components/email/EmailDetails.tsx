import { ProcessedEmail } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, Tag, ChevronLeft, CheckCircle2 } from 'lucide-react';
import AttachmentViewer from '../AttachmentViewer';
import { EmailHeader } from './EmailHeader';
import { AttachmentsSection } from './AttachmentsSection';

interface EmailDetailsProps {
  email: ProcessedEmail;
  onMarkReviewed: (emailId: string) => Promise<void>;
  onBack: () => void;
  showBackButton?: boolean;
  userEmail?: string;
}

export function EmailDetails({ 
  email, 
  onMarkReviewed, 
  onBack,
  showBackButton = false 
}: EmailDetailsProps) {
  return (
    <div className="h-full flex flex-col">
      <EmailHeader
        email={email}
        onMarkReviewed={onMarkReviewed}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <p>From: {email.from}</p>
              <p>To: {email.to.join(', ')}</p>
              <p>{format(new Date(email.timestamp), 'PPp')}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">
                  Sentiment: {(email.aiAnalysis.sentiment * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <div className="flex gap-1">
                  {email.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Card className="p-4">
            <div className="prose prose-sm max-w-none">
              {email.body}
            </div>
          </Card>

          {email.attachments.length > 0 && (
            <AttachmentsSection attachments={email.attachments} />
          )}
        </div>
      </div>
    </div>
  );
}
