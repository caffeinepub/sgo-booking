import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { ImageIcon } from 'lucide-react';
import { getDisplayablePictures, FailedImageTracker } from '../../utils/roomPictures';

interface RoomPhotosSectionProps {
  pictures: string[];
  roomNumber: string;
  onImageClick?: (imageUrl: string) => void;
  compact?: boolean;
}

export function RoomPhotosSection({ pictures, roomNumber, onImageClick, compact = false }: RoomPhotosSectionProps) {
  const [failedTracker] = useState(() => new FailedImageTracker());
  const [, setRefreshKey] = useState(0);

  // Reset failed tracker when pictures change
  useEffect(() => {
    failedTracker.reset();
    setRefreshKey((k) => k + 1);
  }, [pictures, failedTracker]);

  const displayablePictures = getDisplayablePictures(pictures, failedTracker);

  const handleImageError = (url: string) => {
    failedTracker.markFailed(url);
    setRefreshKey((k) => k + 1); // Force re-render
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

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Main Thumbnail */}
        <div className="relative w-full h-40 overflow-hidden rounded-lg border bg-muted">
          <img
            src={displayablePictures[0]}
            alt={`Room ${roomNumber} - Main`}
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick?.(displayablePictures[0])}
            onError={() => handleImageError(displayablePictures[0])}
          />
        </div>

        {/* Thumbnail Grid */}
        {displayablePictures.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {displayablePictures.slice(1, 5).map((pic, idx) => (
              <div
                key={`${pic}-${idx}`}
                className="relative aspect-square overflow-hidden rounded border bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick?.(pic)}
              >
                <img
                  src={pic}
                  alt={`Room ${roomNumber} - ${idx + 2}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(pic)}
                />
              </div>
            ))}
            {displayablePictures.length > 5 && (
              <div className="relative aspect-square overflow-hidden rounded border bg-muted/50 flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  +{displayablePictures.length - 5}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
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
          onError={() => handleImageError(displayablePictures[0])}
        />
      </div>

      {/* Thumbnail Grid */}
      {displayablePictures.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayablePictures.slice(1, 5).map((pic, idx) => (
            <div
              key={`${pic}-${idx}`}
              className="relative aspect-square overflow-hidden rounded border bg-muted cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onImageClick?.(pic)}
            >
              <img
                src={pic}
                alt={`Room ${roomNumber} - ${idx + 2}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(pic)}
              />
            </div>
          ))}
          {displayablePictures.length > 5 && (
            <div className="relative aspect-square overflow-hidden rounded border bg-muted/50 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                +{displayablePictures.length - 5}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
