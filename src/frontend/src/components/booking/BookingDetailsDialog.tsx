import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { BookingStatusBadge } from './BookingStatusBadge';
import { formatMoney } from '../../utils/money';
import { Calendar, Users, Hotel, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { BookingRequest } from '../../types/extended-backend';

interface BookingDetailsDialogProps {
  booking: BookingRequest;
  showGuestPrincipal?: boolean;
}

export function BookingDetailsDialog({ booking, showGuestPrincipal = false }: BookingDetailsDialogProps) {
  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(booking.userId.toString());
    toast.success('Guest principal copied to clipboard');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Booking ID: #{booking.id.toString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <BookingStatusBadge status={booking.status} />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                Check-in
              </p>
              <p className="font-medium">
                {new Date(Number(booking.checkIn) / 1000000).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                Check-out
              </p>
              <p className="font-medium">
                {new Date(Number(booking.checkOut) / 1000000).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Users className="h-3 w-3 inline mr-1" />
                Guests
              </p>
              <p className="font-medium">{booking.guests.toString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <Hotel className="h-3 w-3 inline mr-1" />
                Rooms
              </p>
              <p className="font-medium">{booking.roomsCount.toString()}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Price</p>
            <p className="text-2xl font-bold">
              {formatMoney(booking.totalPrice, booking.currency)}
            </p>
          </div>

          {showGuestPrincipal && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Guest Internet Identity</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                    {booking.userId.toString()}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPrincipal}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-1">Booking Date</p>
            <p className="text-sm">
              {new Date(Number(booking.timestamp) / 1000000).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
