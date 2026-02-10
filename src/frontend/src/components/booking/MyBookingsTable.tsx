import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useGetCallerBookings, useGetHotels, useCancelBooking } from '../../hooks/useQueries';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingDetailsDialog } from './BookingDetailsDialog';
import { BookingStatus } from '../../types/extended-backend';
import { formatMoney } from '../../utils/money';
import { Calendar, Users, Hotel, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function MyBookingsTable() {
  const { data: bookingResult, isLoading, error } = useGetCallerBookings();
  const { data: hotels } = useGetHotels();
  const cancelBooking = useCancelBooking();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<bigint | null>(null);

  const bookings = bookingResult?.bookings || [];

  const getHotelName = (hotelId: any) => {
    if (!hotelId || !hotels) return 'Unknown Hotel';
    const hotel = hotels.find((h) => h.id.toString() === hotelId.toString());
    return hotel?.name || 'Unknown Hotel';
  };

  const handleCancelClick = (bookingId: bigint) => {
    setSelectedBookingId(bookingId);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;

    try {
      await cancelBooking.mutateAsync(selectedBookingId);
      toast.success('Booking canceled successfully');
      setCancelDialogOpen(false);
      setSelectedBookingId(null);
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const canGuestCancel = (booking: any) => {
    return booking.status === BookingStatus.pendingTransfer;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Loading your bookings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load bookings. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>You haven't made any bookings yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Browse hotels and make your first booking to see it here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id.toString()}>
                    <TableCell className="font-mono text-sm">
                      #{booking.id.toString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getHotelName(booking.hotelId)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(Number(booking.checkIn) / 1000000).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(Number(booking.checkOut) / 1000000).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" />
                        {booking.guests.toString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatMoney(booking.totalPrice, booking.currency)}
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canGuestCancel(booking) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelClick(booking.id)}
                            disabled={cancelBooking.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        <BookingDetailsDialog booking={booking} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelBooking.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelBooking.isPending ? 'Canceling...' : 'Yes, cancel booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
