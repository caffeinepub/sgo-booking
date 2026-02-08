import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Principal } from '@icp-sdk/core/principal';
import { useGetHotels, useGetRooms, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Building2, MapPin, ArrowLeft, AlertCircle, MapPinned, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { BookingForm } from '../components/booking/BookingForm';
import { HotelPaymentMethodsList } from '../components/payments/HotelPaymentMethodsList';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { formatMoney } from '../utils/money';

export function HotelDetailPage() {
  const { hotelId } = useParams({ from: '/browse/$hotelId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: hotels, isLoading: hotelsLoading } = useGetHotels();
  const { data: rooms, isLoading: roomsLoading } = useGetRooms({ hotelId: Principal.fromText(hotelId) });
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const needsProfile = isAuthenticated && profileFetched && userProfile === null;

  const hotel = hotels?.find((h) => h.id.toString() === hotelId);
  const hotelRooms = rooms?.filter((r) => r.hotelId.toString() === hotelId) || [];

  if (hotelsLoading || roomsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Hotel Not Found</CardTitle>
            <CardDescription>The hotel you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/browse' })}>Back to Browse Hotels</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBookRoom = (room: any) => {
    if (!isAuthenticated) {
      toast.error('Please log in to make a booking');
      return;
    }

    if (needsProfile) {
      setShowProfilePrompt(true);
      return;
    }

    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/browse' })} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Hotels
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  <CardTitle className="text-3xl">{hotel.name}</CardTitle>
                </div>
                <CardDescription className="flex items-center gap-1 text-base mb-2">
                  <MapPin className="h-4 w-4" />
                  {hotel.location}
                </CardDescription>
                {hotel.address && (
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <MapPinned className="h-4 w-4" />
                    {hotel.address}
                  </CardDescription>
                )}
                {hotel.mapLink && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(hotel.mapLink, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Map
                    </Button>
                  </div>
                )}
              </div>
              {hotel.active && <Badge variant="default">Active</Badge>}
            </div>
          </CardHeader>
        </Card>

        {showProfilePrompt && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profile Required</AlertTitle>
            <AlertDescription>
              Please complete your profile before making a booking. Visit Account Status to set up your profile.
            </AlertDescription>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => navigate({ to: '/account-status' })} size="sm">
                Complete Profile
              </Button>
              <Button onClick={() => setShowProfilePrompt(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </Alert>
        )}

        {showBookingForm && selectedRoom !== null ? (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Booking</CardTitle>
              <CardDescription>Fill in the details below to reserve your room</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm
                hotelId={Principal.fromText(hotelId)}
                room={selectedRoom}
                onSuccess={() => {
                  setShowBookingForm(false);
                  setSelectedRoom(null);
                  toast.success('Booking created successfully! Check Guest Account for details.');
                }}
                onCancel={() => {
                  setShowBookingForm(false);
                  setSelectedRoom(null);
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
              {hotelRooms.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>No rooms available at this hotel yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hotelRooms.map((room) => (
                    <Card key={room.id.toString()}>
                      <CardHeader>
                        <CardTitle>
                          Room {room.roomNumber} - {room.roomType}
                        </CardTitle>
                        <CardDescription>
                          {formatMoney(room.pricePerNight, room.currency)} per night
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {room.pictures && room.pictures.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <ImageIcon className="h-4 w-4" />
                              Room Photos
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {room.pictures.slice(0, 4).map((pic, index) => (
                                <img
                                  key={index}
                                  src={pic}
                                  alt={`Room ${room.roomNumber} - Photo ${index + 1}`}
                                  className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setSelectedImage(pic)}
                                />
                              ))}
                            </div>
                            {room.pictures.length > 4 && (
                              <p className="text-xs text-muted-foreground">
                                +{room.pictures.length - 4} more photos
                              </p>
                            )}
                          </div>
                        )}
                        <Button onClick={() => handleBookRoom(room)} className="w-full">
                          Book This Room
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <HotelPaymentMethodsList
              paymentMethods={hotel.paymentMethods}
              hotelName={hotel.name}
              hotelContact={hotel.contact}
            />
          </>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={selectedImage} alt="Room preview" className="max-w-full max-h-[90vh] object-contain rounded" />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
