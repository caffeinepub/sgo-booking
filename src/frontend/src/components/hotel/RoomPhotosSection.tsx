import React, { useState } from 'react';
import { Card } from '../ui/card';
import { ImageIcon } from 'lucide-react';

interface RoomPhotosSectionProps {
  pictures: string[];
  roomNumber: string;
  onImageClick?: (imageUrl: string) => void;
}

export function RoomPhotosSection({ pictures, roomNumber, onImageClick }: RoomPhotosSectionProps) {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  
  // Sanitize and filter valid picture URLs
  const validPictures = pictures.filter((pic) => {
    if (!pic || typeof pic !== 'string') return false;
    // Check if it's a valid data URL or HTTP URL
    return pic.startsWith('data:image/') || pic.startsWith('http://') || pic.startsWith('https://');
  });

  // Filter out failed images
  const displayablePictures = validPictures.filter((_, index) => !failedImages.has(index));

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  if (displayablePictures.length === 0) {
    return (
      <Card className="p-8 bg-muted/30">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No photos available for this room</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
        <img
          src={displayablePictures[0]}
          alt={`Room ${roomNumber} - Main`}
          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick?.(displayablePictures[0])}
          onError={() => handleImageError(0)}
        />
      </div>

      {/* Thumbnail Grid */}
      {displayablePictures.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayablePictures.slice(1, 5).map((pic, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded border bg-muted cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onImageClick?.(pic)}
            >
              <img
                src={pic}
                alt={`Room ${roomNumber} - ${index + 2}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index + 1)}
              />
            </div>
          ))}
          {displayablePictures.length > 5 && (
            <div className="relative aspect-square overflow-hidden rounded border bg-muted/50 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                +{displayablePictures.length - 5} more
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
