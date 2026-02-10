import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { useCreateBooking } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { formatMoney } from '../../utils/money';
import { Calendar, Users, Hotel, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { RoomView, HotelDataView, BookingRequest } from '../../types/extended-backend';

interface BookingFormProps {
  hotel: HotelDataView;
  room: RoomView;
}

export function BookingForm({ hotel, room }: BookingFormProps) {
  const { identity } = useInternetIdentity();
  const createBooking = useCreateBooking();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomsCount, setRoomsCount] = useState('1');
  const [guests, setGuests] = useState('1');
  const [bookingSuccess, setBookingSuccess] = useState<BookingRequest | null>(null);

  const isAuthenticated = !!identity;

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    const rooms = parseInt(roomsCount) || 1;
    // Use discounted price for calculation
    const pricePerNight = room.promoPercent > BigInt(0) ? room.discountedPrice : room.pricePerNight;
    return BigInt(Number(pricePerNight) * nights * rooms);
  };

  const validateForm = () => {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return false;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      toast.error('Check-in date cannot be in the past');
      return false;
    }

    if (end <= start) {
      toast.error('Check-out date must be after check-in date');
      return false;
    }

    const roomsNum = parseInt(roomsCount);
    const guestsNum = parseInt(guests);

    if (roomsNum < 1) {
      toast.error('Number of rooms must be at least 1');
      return false;
    }

    if (guestsNum < 1) {
      toast.error('Number of guests must be at least 1');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to make a booking');
      return;
    }

    if (!validateForm()) return;

    try {
      const checkInMs = new Date(checkIn).getTime() * 1000000; // Convert to nanoseconds
      const checkOutMs = new Date(checkOut).getTime() * 1000000;

      const booking = await createBooking.mutateAsync({
        hotelId: hotel.id,
        roomId: room.id,
        checkIn: BigInt(checkInMs),
        checkOut: BigInt(checkOutMs),
        guests: BigInt(guests),
        roomsCount: BigInt(roomsCount),
        currency: room.currency,
      });

      setBookingSuccess(booking);
      toast.success('Booking created successfully!');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    }
  };

  if (bookingSuccess !== null) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-900">Booking Confirmed!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Booking ID</p>
            <p className="font-mono text-lg font-semibold">#{bookingSuccess.id.toString()}</p>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <p className="font-medium">Next Steps:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your booking is pending confirmation from the hotel</li>
              <li>Check "My Bookings" for status updates</li>
              <li>Contact the hotel if you need to make changes</li>
            </ul>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setBookingSuccess(null)}
          >
            Make Another Booking
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Book This Room</CardTitle>
          <CardDescription>Login required to make a booking</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in with Internet Identity to book this room.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();
  const pricePerNight = room.promoPercent > BigInt(0) ? room.discountedPrice : room.pricePerNight;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Room</CardTitle>
        <CardDescription>{room.roomType}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkIn">
              <Calendar className="h-4 w-4 inline mr-1" />
              Check-in Date
            </Label>
            <Input
              id="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkOut">
              <Calendar className="h-4 w-4 inline mr-1" />
              Check-out Date
            </Label>
            <Input
              id="checkOut"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              min={checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomsCount">
              <Hotel className="h-4 w-4 inline mr-1" />
              Number of Rooms
            </Label>
            <Input
              id="roomsCount"
              type="number"
              min="1"
              value={roomsCount}
              onChange={(e) => setRoomsCount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">
              <Users className="h-4 w-4 inline mr-1" />
              Number of Guests
            </Label>
            <Input
              id="guests"
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              required
            />
          </div>

          {nights > 0 && (
            <>
              <Separator />
              <div className="space-y-2 bg-muted p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per night:</span>
                  <span className="font-medium">{formatMoney(pricePerNight, room.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Number of nights:</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Number of rooms:</span>
                  <span className="font-medium">{roomsCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total Price:</span>
                  <span className="font-bold text-lg">{formatMoney(totalPrice, room.currency)}</span>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={createBooking.isPending || !checkIn || !checkOut}
          >
            {createBooking.isPending ? 'Creating Booking...' : 'Confirm Booking'}
          </Button>

          {createBooking.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createBooking.error.message || 'Failed to create booking'}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
