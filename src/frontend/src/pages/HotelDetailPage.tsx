import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetHotels } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { BookingForm } from '../components/booking/BookingForm';
import { RoomPhotosSection } from '../components/hotel/RoomPhotosSection';
import { HotelPaymentMethodsList } from '../components/payments/HotelPaymentMethodsList';
import { MapPin, Phone, Mail, ExternalLink, Loader2 } from 'lucide-react';
import { formatMoney } from '../utils/money';
import type { RoomView } from '../types/extended-backend';

export function HotelDetailPage() {
  const { hotelId } = useParams({ from: '/browse/$hotelId' });
  const { data: hotels, isLoading } = useGetHotels();
  const [selectedRoom, setSelectedRoom] = useState<RoomView | null>(null);

  const hotel = hotels?.find((h) => h.id.toString() === hotelId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Hotel not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rooms = hotel.rooms || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{hotel.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                {hotel.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground">{hotel.address}</p>
              </div>

              {hotel.mapLink && (
                <div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={hotel.mapLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View on Map
                    </a>
                  </Button>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  {hotel.contact.whatsapp && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{hotel.contact.whatsapp}</span>
                    </div>
                  )}
                  {hotel.contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{hotel.contact.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Rooms</CardTitle>
              <CardDescription>Select a room to book</CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No rooms available at this time</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {rooms.map((room) => (
                    <Card
                      key={room.id.toString()}
                      className={`cursor-pointer transition-all ${
                        selectedRoom?.id === room.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{room.roomType}</CardTitle>
                            <CardDescription className="mt-2 space-y-1">
                              {room.promoPercent > BigInt(0) ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="line-through text-muted-foreground">
                                      {formatMoney(room.pricePerNight, room.currency)}
                                    </span>
                                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                                      {room.promoPercent.toString()}% OFF
                                    </span>
                                  </div>
                                  <div className="font-semibold text-green-600 text-lg">
                                    {formatMoney(room.discountedPrice, room.currency)} per night
                                  </div>
                                </>
                              ) : (
                                <div className="text-lg font-semibold">
                                  {formatMoney(room.pricePerNight, room.currency)} per night
                                </div>
                              )}
                            </CardDescription>
                          </div>
                          <Button
                            variant={selectedRoom?.id === room.id ? 'default' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoom(room);
                            }}
                          >
                            {selectedRoom?.id === room.id ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <RoomPhotosSection pictures={room.pictures} roomType={room.roomType} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <HotelPaymentMethodsList hotel={hotel} />
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          {selectedRoom ? (
            <BookingForm hotel={hotel} room={selectedRoom} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Book a Room</CardTitle>
                <CardDescription>Select a room to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Please select a room from the available options to proceed with your booking.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
