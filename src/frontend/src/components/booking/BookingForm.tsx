import React, { useState } from 'react';
import { Principal } from '@icp-sdk/core/principal';
import { useCreateBooking } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Users } from 'lucide-react';
import { formatMoney } from '../../utils/money';
import { RoomView } from '../../backend';

interface BookingFormProps {
  hotelId: Principal;
  room: RoomView;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingForm({ hotelId, room, onSuccess, onCancel }: BookingFormProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const createBooking = useCreateBooking();

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return BigInt(0);
    const checkInDate = new Date(checkIn).getTime();
    const checkOutDate = new Date(checkOut).getTime();
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 86400)));
    return BigInt(nights) * room.pricePerNight;
  };

  const totalPrice = calculateTotal();
  const nights = checkIn && checkOut 
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 86400)))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const checkInDate = new Date(checkIn).getTime() * 1000000;
    const checkOutDate = new Date(checkOut).getTime() * 1000000;
    const guestsNum = BigInt(guests);

    await createBooking.mutateAsync({
      hotelId,
      roomId: room.id,
      checkIn: BigInt(checkInDate),
      checkOut: BigInt(checkOutDate),
      guests: guestsNum,
      currency: room.currency,
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkIn" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
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
        <div>
          <Label htmlFor="checkOut" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
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
      </div>

      <div>
        <Label htmlFor="guests" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Number of Guests
        </Label>
        <Input
          id="guests"
          type="number"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          required
          min="1"
          max="2"
        />
        <p className="text-xs text-muted-foreground mt-1">Maximum 2 guests per room</p>
      </div>

      {nights > 0 && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price per night:</span>
            <span className="font-medium">{formatMoney(room.pricePerNight, room.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Number of nights:</span>
            <span className="font-medium">{nights}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span>{formatMoney(totalPrice, room.currency)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={createBooking.isPending} className="flex-1">
          {createBooking.isPending ? 'Creating Booking...' : 'Confirm Booking'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={createBooking.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
