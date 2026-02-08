import React, { useState } from 'react';
import { useGetHotels } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Building2, MapPin, ImageIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { ImagePreviewDialog } from '../components/common/ImagePreviewDialog';
import { getFirstValidPicture } from '../utils/roomPictures';

export function BrowseHotelsPage() {
  const { data: hotels, isLoading } = useGetHotels();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const getRepresentativePhoto = (hotel: any): string | null => {
    if (!hotel.rooms || hotel.rooms.length === 0) return null;
    
    for (const room of hotel.rooms) {
      if (room.pictures && room.pictures.length > 0) {
        const validPic = getFirstValidPicture(room.pictures);
        if (validPic) return validPic;
      }
    }
    return null;
  };

  const handleImageError = (hotelId: string) => {
    setImageErrors((prev) => new Set(prev).add(hotelId));
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Hotels</h1>
          <p className="text-muted-foreground">Discover and book your perfect stay</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading hotels...</p>
          </div>
        ) : !hotels || hotels.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Hotels Available</CardTitle>
              <CardDescription>
                There are currently no active hotels. Please check back later or contact the administrator.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => {
              const hotelKey = hotel.id.toString();
              const representativePhoto = getRepresentativePhoto(hotel);
              const hasImageError = imageErrors.has(hotelKey);
              const showPhoto = representativePhoto && !hasImageError;
              
              return (
                <Card key={hotelKey} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Room Photo Thumbnail */}
                  {showPhoto ? (
                    <div 
                      className="relative w-full h-48 overflow-hidden bg-muted cursor-pointer group"
                      onClick={() => setPreviewImage(representativePhoto)}
                    >
                      <img
                        src={representativePhoto}
                        alt={`${hotel.name} room`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => handleImageError(hotelKey)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ) : (
                    <div className="relative w-full h-48 bg-muted flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                        <p className="text-sm text-muted-foreground">No photos available</p>
                      </div>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">{hotel.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {hotel.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {hotel.rooms.length} room{hotel.rooms.length !== 1 ? 's' : ''} available
                      </div>
                      <Button
                        onClick={() => navigate({ to: '/browse/$hotelId', params: { hotelId: hotel.id.toString() } })}
                        className="w-full"
                      >
                        View Details & Book
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ImagePreviewDialog
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
        title="Room Photo"
      />
    </>
  );
}
