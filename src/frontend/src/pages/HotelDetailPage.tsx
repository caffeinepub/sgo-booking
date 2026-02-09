import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Principal } from '@icp-sdk/core/principal';
import { useGetHotels, useGetRooms } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { BookingForm } from '../components/booking/BookingForm';
import { HotelPaymentMethodsList } from '../components/payments/HotelPaymentMethodsList';
import { RoomPhotosSection } from '../components/hotel/RoomPhotosSection';
import { formatMoney } from '../utils/money';
import { Building2, MapPin, ArrowLeft, ExternalLink } from 'lucide-react';

export default function HotelDetailPage() {
  const { hotelId } = useParams({ from: '/browse/$hotelId' });
  const navigate = useNavigate();
  const { data: hotels, isLoading: hotelsLoading } = useGetHotels();

  const hotelPrincipal = Principal.fromText(hotelId);
  const hotel = hotels?.find((h) => h.id.toString() === hotelId);

  const { data: rooms, isLoading: roomsLoading, error: roomsError } = useGetRooms({ hotelId: hotelPrincipal || null });

  const [selectedRoom, setSelectedRoom] = React.useState<any>(null);

  if (hotelsLoading || roomsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading hotel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Hotel not found</p>
            <Button onClick={() => navigate({ to: '/browse' })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/browse' })} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Browse
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    <CardTitle className="text-3xl">{hotel.name}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    {hotel.location}
                  </CardDescription>
                </div>
                {hotel.active && <Badge variant="default">Active</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground">{hotel.address}</p>
              </div>
              {hotel.mapLink && (
                <Button variant="outline" size="sm" asChild>
                  <a href={hotel.mapLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Map
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Rooms</CardTitle>
              <CardDescription>
                {rooms && rooms.length > 0
                  ? `${rooms.length} room${rooms.length !== 1 ? 's' : ''} available`
                  : 'No rooms available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roomsError ? (
                <p className="text-destructive text-sm">Failed to load rooms</p>
              ) : !rooms || rooms.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No rooms available at this hotel</p>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <Card key={room.id.toString()} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="md:w-48 flex-shrink-0">
                            <RoomPhotosSection 
                              pictures={room.pictures} 
                              roomNumber={room.roomNumber}
                              compact 
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{room.roomType}</h3>
                                <p className="text-sm text-muted-foreground">Room {room.roomNumber}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">{formatMoney(room.pricePerNight, room.currency)}</p>
                                <p className="text-sm text-muted-foreground">per night</p>
                              </div>
                            </div>
                            <Separator />
                            <Button
                              onClick={() => setSelectedRoom(room)}
                              className="w-full md:w-auto"
                              disabled={selectedRoom?.id === room.id}
                            >
                              {selectedRoom?.id === room.id ? 'Selected' : 'Book This Room'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <HotelPaymentMethodsList
            paymentMethods={hotel.paymentMethods}
            contact={hotel.contact}
            hotelName={hotel.name}
          />
        </div>

        <div className="lg:col-span-1">
          {selectedRoom ? (
            <div className="sticky top-4">
              <BookingForm />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Select a room to book</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
