import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
  title?: string;
}

export function ImagePreviewDialog({ imageUrl, onClose, title = 'Image Preview' }: ImagePreviewDialogProps) {
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="relative w-full p-6 pt-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
