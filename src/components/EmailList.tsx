import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { ProcessedEmail } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { EmailListItem } from './email/EmailListItem';
import { EmailDetails } from './email/EmailDetails';

interface EmailListProps {
  staffEmail?: string;
  initialEmailId?: string;
}

const priorityColors = {
  low: 'bg-green-500/10 text-green-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  high: 'bg-red-500/10 text-red-500'
};

export default function EmailList({ staffEmail, initialEmailId }: EmailListProps) {
  const { user, canAccessEmail } = useAuth();
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<ProcessedEmail | null>(null);
  const [filter, setFilter] = useState<'all' | 'unreviewed' | 'reviewed'>('unreviewed');
  const [selectedAttachment, setSelectedAttachment] = useState<number>(0);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    let q = query(
      collection(db, 'processedEmails'),
      orderBy('timestamp', 'desc')
    );

    if (staffEmail) {
      q = query(q, where('to', 'array-contains', staffEmail));
    } else if (user && !canAccessEmail(['*'])) {
      q = query(q, where('to', 'array-contains', user.email));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emailData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((email) => canAccessEmail(email.to)) as ProcessedEmail[];

      setEmails(emailData);

      if (initialEmailId) {
        const initialEmail = emailData.find(e => e.id === initialEmailId);
        if (initialEmail) {
          setSelectedEmail(initialEmail);
          setShowList(false);
        }
      }
    });

    return unsubscribe;
  }, [user, staffEmail, initialEmailId, canAccessEmail]);

  const filteredEmails = emails.filter((email) => {
    if (filter === 'unreviewed') return !email.reviewed;
    if (filter === 'reviewed') return email.reviewed;
    return true;
  });

  const markAsReviewed = async (emailId: string) => {
    await updateDoc(doc(db, 'processedEmails', emailId), {
      reviewed: true,
      reviewedAt: new Date(),
      reviewedBy: user?.email
    });
  };

  // Mobile view handler
  const handleEmailSelect = (email: ProcessedEmail) => {
    setSelectedEmail(email);
    setShowList(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Email List */}
      <div className={cn(
        "w-full md:w-1/3 md:border-r transition-all duration-300",
        !showList && "hidden md:block"
      )}>
        <div className="mb-4">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <TabsList className="w-full">
              <TabsTrigger value="unreviewed" className="flex-1">Unreviewed</TabsTrigger>
              <TabsTrigger value="reviewed" className="flex-1">Reviewed</TabsTrigger>
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2 px-4 md:px-0 md:pr-4">
            {filteredEmails.map((email) => (
              <Card
                key={email.id}
                className={cn(
                  "p-3 cursor-pointer transition-colors",
                  selectedEmail?.id === email.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleEmailSelect(email)}
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
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Email Content */}
      <div className={cn(
        "flex-1 md:block transition-all duration-300",
        showList && "hidden"
      )}>
        {selectedEmail ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 md:px-6 border-b">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowList(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold truncate">{selectedEmail.subject}</h2>
              {!selectedEmail.reviewed && (
                <Button onClick={() => markAsReviewed(selectedEmail.id)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Reviewed
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4 md:p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <p>From: {selectedEmail.from}</p>
                    <p>To: {selectedEmail.to.join(', ')}</p>
                    <p>{format(new Date(selectedEmail.timestamp), 'PPp')}</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">
                        Sentiment: {(selectedEmail.aiAnalysis.sentiment * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <div className="flex gap-1">
                        {selectedEmail.tags.map((tag) => (
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
                    {selectedEmail.body}
                  </div>
                </Card>

                {selectedEmail.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="font-semibold">Attachments</h3>
                      <div className="flex gap-1">
                        {selectedEmail.attachments.map((_, index) => (
                          <Button
                            key={index}
                            variant={selectedAttachment === index ? "default" : "outline"}
                            size="icon"
                            onClick={() => setSelectedAttachment(index)}
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Card className="p-4">
                      <AttachmentViewer
                        attachment={selectedEmail.attachments[selectedAttachment]}
                      />
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Select an email to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
}
