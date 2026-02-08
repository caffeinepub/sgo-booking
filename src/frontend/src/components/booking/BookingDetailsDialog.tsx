import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { BookingRequest } from '../../types/extended-backend';
import { BookingStatusBadge } from './BookingStatusBadge';
import { formatMoney } from '../../utils/money';
import { Eye, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface BookingDetailsDialogProps {
  booking: BookingRequest;
  showGuestPrincipal?: boolean;
}

export function BookingDetailsDialog({ booking, showGuestPrincipal = false }: BookingDetailsDialogProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(booking.userId.toString());
    setCopied(true);
    toast.success('Guest principal copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <p className="font-mono text-sm">#{booking.id.toString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Check-in</p>
              <p className="font-medium">{new Date(Number(booking.checkIn) / 1000000).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-out</p>
              <p className="font-medium">{new Date(Number(booking.checkOut) / 1000000).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Guests</p>
              <p className="font-medium">{booking.guests.toString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
              <p className="font-semibold text-lg">{formatMoney(booking.totalPrice, booking.currency)}</p>
            </div>
          </div>

          {showGuestPrincipal && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Guest Internet Identity</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                    {booking.userId.toString()}
                  </code>
                  <Button variant="ghost" size="sm" onClick={handleCopyPrincipal}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}

          {booking.paymentProof && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payment Proof</p>
                <Badge variant="default">Uploaded</Badge>
              </div>
            </>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Booking Date</p>
            <p className="text-sm">{new Date(Number(booking.timestamp) / 1000000).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
