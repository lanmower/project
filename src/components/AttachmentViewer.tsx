import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Bot,
  Tag,
  Calendar,
  Hash
} from 'lucide-react';
import type { Attachment } from '@/lib/types';
import { cn } from '@/lib/utils';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface AttachmentViewerProps {
  attachment: Attachment;
}

export default function AttachmentViewer({ attachment }: AttachmentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + offset;
      if (numPages === null) return prevPageNumber;
      return Math.min(Math.max(1, newPage), numPages);
    });
  }

  const MetadataSection = () => (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Bot className="h-4 w-4" />
        <span>AI Analysis</span>
      </div>
      
      {attachment.aiMetadata && (
        <div className="grid gap-3">
          {attachment.aiMetadata.type && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Type: {attachment.aiMetadata.type}</span>
            </div>
          )}
          
          {attachment.aiMetadata.tags && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {attachment.aiMetadata.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {attachment.aiMetadata.date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Date: {attachment.aiMetadata.date}</span>
            </div>
          )}
          
          {attachment.aiMetadata.pageCount && (
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Pages: {attachment.aiMetadata.pageCount}</span>
            </div>
          )}
          
          {attachment.aiMetadata.summary && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Summary:</p>
              <p className="line-clamp-3">{attachment.aiMetadata.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const ViewerControls = () => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        {attachment.mimeType === 'application/pdf' && (
          <>
            <Button
              variant="outline"
              size="icon"
              disabled={pageNumber <= 1}
              onClick={() => changePage(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pageNumber} of {numPages || '--'}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={numPages === null || pageNumber >= numPages}
              onClick={() => changePage(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <a href={attachment.url} download={attachment.filename}>
            <Download className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFullscreen(true)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (attachment.mimeType === 'application/pdf') {
      return (
        <Document
          file={attachment.url}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="max-w-full"
            width={600}
          />
        </Document>
      );
    }

    if (attachment.mimeType.startsWith('image/')) {
      return imageError ? (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-2" />
          <p>Failed to load image</p>
        </div>
      ) : (
        <img
          src={attachment.url}
          alt={attachment.filename}
          className="max-w-full rounded-lg"
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div className="flex items-center justify-center p-8">
        <Button asChild>
          <a href={attachment.url} download={attachment.filename}>
            Download {attachment.filename}
          </a>
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <ViewerControls />
      
      <div className="grid md:grid-cols-3 gap-4">
        <Card className={cn(
          "md:col-span-2 p-4 flex items-center justify-center min-h-[400px]",
          attachment.mimeType === 'application/pdf' && "bg-muted"
        )}>
          <ScrollArea className="w-full h-full">
            {renderContent()}
          </ScrollArea>
        </Card>

        <Card className="h-fit">
          <MetadataSection />
        </Card>
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-7xl w-full h-[90vh]">
          <ScrollArea className="h-full">
            {renderContent()}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}