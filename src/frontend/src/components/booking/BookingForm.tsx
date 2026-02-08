import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { RoomView } from '../../types/extended-backend';
import { useCreateBooking } from '../../hooks/useQueries';
import { formatMoney } from '../../utils/money';
import { Calendar, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

interface BookingFormProps {
  room: RoomView;
}

export function BookingForm({ room }: BookingFormProps) {
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [error, setError] = useState('');

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const totalPrice = nights * Number(room.pricePerNight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (nights <= 0) {
      setError('Check-out date must be after check-in date');
      return;
    }

    const guestCount = parseInt(guests);
    if (isNaN(guestCount) || guestCount < 1) {
      setError('Please enter a valid number of guests');
      return;
    }

    try {
      const checkInMs = BigInt(new Date(checkIn).getTime() * 1000000);
      const checkOutMs = BigInt(new Date(checkOut).getTime() * 1000000);

      await createBooking.mutateAsync({
        hotelId: room.hotelId,
        roomId: room.id,
        checkIn: checkInMs,
        checkOut: checkOutMs,
        guests: BigInt(guestCount),
        currency: room.currency,
      });

      toast.success('Booking created successfully!');
      navigate({ to: '/account' });
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
      toast.error('Failed to create booking');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Room</CardTitle>
        <CardDescription>
          {room.roomType} - Room {room.roomNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">
                <Calendar className="h-4 w-4 inline mr-1" />
                Check-in
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">
                <Calendar className="h-4 w-4 inline mr-1" />
                Check-out
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
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
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Price per night:</span>
                <span className="font-medium">{formatMoney(room.pricePerNight, room.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Number of nights:</span>
                <span className="font-medium">{nights}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total:</span>
                <span>{formatMoney(BigInt(totalPrice), room.currency)}</span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={createBooking.isPending || nights <= 0}>
            {createBooking.isPending ? 'Creating Booking...' : 'Confirm Booking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
