import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AttachmentViewer from '../AttachmentViewer';

interface AttachmentsSectionProps {
  attachments: any[];
}

export function AttachmentsSection({ attachments }: AttachmentsSectionProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<number>(0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">Attachments</h3>
        <div className="flex gap-1">
          {attachments.map((_, index) => (
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
          attachment={attachments[selectedAttachment]}
        />
      </Card>
    </div>
  );
}
