import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Principal } from '@icp-sdk/core/principal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { useGetHotels, useGetRooms } from '../hooks/useQueries';
import { BookingForm } from '../components/booking/BookingForm';
import { HotelPaymentMethodsList } from '../components/payments/HotelPaymentMethodsList';
import { RoomPhotosSection } from '../components/hotel/RoomPhotosSection';
import { MapPin, ExternalLink, Loader2, AlertCircle, Home } from 'lucide-react';
import { formatMoney } from '../utils/money';

export default function HotelDetailPage() {
  const { hotelId } = useParams({ from: '/browse/$hotelId' });
  const navigate = useNavigate();
  const { data: hotels, isLoading: hotelsLoading, error: hotelsError } = useGetHotels();
  
  // Convert hotelId string to Principal for the query
  const hotelPrincipal = hotelId ? Principal.fromText(hotelId) : undefined;
  const { data: rooms, isLoading: roomsLoading, error: roomsError } = useGetRooms({ hotelId: hotelPrincipal });
  
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const hotel = hotels?.find((h) => h.id.toString() === hotelId);
  const hotelRooms = rooms?.filter((r) => r.hotelId.toString() === hotelId) || [];

  if (hotelsLoading || roomsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (hotelsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Hotels</AlertTitle>
          <AlertDescription>
            {hotelsError instanceof Error ? hotelsError.message : 'Failed to load hotel data. Please try again.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/browse' })} className="mt-4 gap-2">
          <Home className="h-4 w-4" />
          Back to Hotels
        </Button>
      </div>
    );
  }

  if (roomsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Rooms</AlertTitle>
          <AlertDescription>
            {roomsError instanceof Error ? roomsError.message : 'Failed to load room data. Please try again.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/browse' })} className="mt-4 gap-2">
          <Home className="h-4 w-4" />
          Back to Hotels
        </Button>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hotel Not Found</AlertTitle>
          <AlertDescription>
            The hotel you're looking for doesn't exist or is no longer available.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/browse' })} className="mt-4 gap-2">
          <Home className="h-4 w-4" />
          Back to Hotels
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hotel Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>{hotel.location}</span>
            </div>
            {hotel.address && (
              <p className="text-sm text-muted-foreground mb-2">{hotel.address}</p>
            )}
            {hotel.mapLink && (
              <a
                href={hotel.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View on Map
              </a>
            )}
          </div>
          <Badge variant={hotel.active ? 'default' : 'secondary'}>
            {hotel.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Available Rooms */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
        {hotelRooms.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Rooms Available</AlertTitle>
            <AlertDescription>
              This hotel doesn't have any rooms listed at the moment.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {hotelRooms.map((room) => (
              <Card key={room.id.toString()} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Room {room.roomNumber} - {room.roomType}</CardTitle>
                      <CardDescription className="mt-2">
                        {formatMoney(room.pricePerNight, room.currency)} per night
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room Photos */}
                  <RoomPhotosSection
                    pictures={room.pictures || []}
                    roomNumber={room.roomNumber}
                    onImageClick={setPreviewImage}
                  />

                  <Button
                    onClick={() => setSelectedRoom(room)}
                    className="w-full"
                  >
                    Book This Room
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* Payment Methods */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
        <HotelPaymentMethodsList
          paymentMethods={hotel.paymentMethods}
          hotelName={hotel.name}
          hotelContact={hotel.contact}
        />
      </div>

      {/* Booking Dialog */}
      {selectedRoom && (
        <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book Room {selectedRoom.roomNumber}</DialogTitle>
            </DialogHeader>
            <BookingForm
              room={selectedRoom}
              hotelId={hotel.id}
              onSuccess={() => {
                setSelectedRoom(null);
                navigate({ to: '/account-status' });
              }}
              onCancel={() => setSelectedRoom(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Image Preview Dialog */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Room Photo</DialogTitle>
            </DialogHeader>
            <div className="relative w-full">
              <img
                src={previewImage}
                alt="Room preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
