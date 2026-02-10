import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ImagePreviewDialog } from '../common/ImagePreviewDialog';
import { isValidPictureUrl, FailedImageTracker } from '../../utils/roomPictures';
import { Trash2, Upload, ImageIcon } from 'lucide-react';
import { Input } from '../ui/input';

interface RoomPhotosSectionProps {
  pictures: string[];
  roomType: string;
  editable?: boolean;
  onPhotoDelete?: (photoUrl: string) => void;
  onPhotoReplace?: (oldPhotoUrl: string, newFile: File) => void;
}

export function RoomPhotosSection({ pictures, roomType, editable = false, onPhotoDelete, onPhotoReplace }: RoomPhotosSectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [failedTracker] = useState(() => new FailedImageTracker());
  const [replacingPhoto, setReplacingPhoto] = useState<string | null>(null);

  const validPictures = pictures.filter((url) => isValidPictureUrl(url) && !failedTracker.hasFailed(url));

  const handleImageError = (url: string) => {
    failedTracker.markFailed(url);
  };

  const handleReplaceClick = (photoUrl: string) => {
    setReplacingPhoto(photoUrl);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, photoUrl: string) => {
    const file = e.target.files?.[0];
    if (file && onPhotoReplace) {
      onPhotoReplace(photoUrl, file);
      setReplacingPhoto(null);
    }
  };

  if (validPictures.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {validPictures.map((url, index) => (
          <div key={`${url}-${index}`} className="relative group">
            <div
              className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => !editable && setSelectedImage(url)}
            >
              <img
                src={url}
                alt={`${roomType} - Photo ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(url)}
              />
            </div>
            {editable && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => handleReplaceClick(url)}
                  title="Replace photo"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  onClick={() => onPhotoDelete?.(url)}
                  title="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            {replacingPhoto === url && (
              <Input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleFileSelect(e, url)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        ))}
      </div>

      {!editable && selectedImage && (
        <ImagePreviewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </>
  );
}
