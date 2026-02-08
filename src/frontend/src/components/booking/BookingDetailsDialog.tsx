import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { BookingRequest } from '../../backend';
import { BookingStatusBadge } from './BookingStatusBadge';
import { formatMoney } from '../../utils/money';
import { Copy, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface BookingDetailsDialogProps {
  booking: BookingRequest;
  trigger?: React.ReactNode;
  showGuestPrincipal?: boolean;
}

export function BookingDetailsDialog({ booking, trigger, showGuestPrincipal = false }: BookingDetailsDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(booking.userId.toString());
      setCopied(true);
      toast.success('Guest Internet Identity copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>Complete information for booking #{booking.id.toString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Booking ID</div>
              <div className="font-mono text-sm">#{booking.id.toString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="mt-1">
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Check-in</div>
              <div>{new Date(Number(booking.checkIn) / 1000000).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Check-out</div>
              <div>{new Date(Number(booking.checkOut) / 1000000).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Guests</div>
              <div>{booking.guests.toString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Price</div>
              <div className="font-semibold">{formatMoney(booking.totalPrice, booking.currency)}</div>
            </div>
          </div>

          {showGuestPrincipal && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Guest Internet Identity</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-xs break-all">
                  {booking.userId.toString()}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPrincipal}
                  className="gap-2 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {booking.hotelId && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Hotel ID</div>
              <code className="text-xs break-all">{booking.hotelId.toString()}</code>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-muted-foreground">Room ID</div>
            <div className="font-mono text-sm">#{booking.roomId.toString()}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground">Booking Created</div>
            <div className="text-sm">{new Date(Number(booking.timestamp) / 1000000).toLocaleString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
