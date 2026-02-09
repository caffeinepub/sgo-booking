import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
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
import { useGetBookings, useUpdateBookingStatus, useGetCallerHotelProfile, useCancelBooking } from '../../hooks/useQueries';
import { BookingStatusBadge } from '../booking/BookingStatusBadge';
import { BookingDetailsDialog } from '../booking/BookingDetailsDialog';
import { BookingStatus } from '../../backend';
import { formatMoney } from '../../utils/money';
import { Calendar, Users, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function HotelBookingsPanel() {
  const { data: hotelProfile } = useGetCallerHotelProfile();
  const { data: bookings, isLoading, error } = useGetBookings(
    hotelProfile ? { hotelId: hotelProfile.id } : undefined
  );
  const updateStatus = useUpdateBookingStatus();
  const cancelBooking = useCancelBooking();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<bigint | null>(null);

  const handleConfirmBooking = async (bookingId: bigint) => {
    try {
      await updateStatus.mutateAsync({
        bookingId,
        newStatus: BookingStatus.booked,
      });
      toast.success('Booking confirmed successfully');
    } catch (error: any) {
      console.error('Failed to confirm booking:', error);
      toast.error(error.message || 'Failed to confirm booking');
    }
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

  const canHotelCancel = (booking: any) => {
    return booking.status === BookingStatus.pendingTransfer || booking.status === BookingStatus.booked;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hotel Bookings</CardTitle>
          <CardDescription>Loading bookings...</CardDescription>
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
          <CardTitle>Hotel Bookings</CardTitle>
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

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hotel Bookings</CardTitle>
          <CardDescription>No bookings yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Bookings from guests will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === BookingStatus.pendingTransfer);
  const confirmedBookings = bookings.filter((b) => b.status !== BookingStatus.pendingTransfer);

  return (
    <>
      <div className="space-y-6">
        {pendingBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Bookings</CardTitle>
              <CardDescription>
                {pendingBookings.length} booking{pendingBookings.length !== 1 ? 's' : ''} awaiting confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingBookings.map((booking) => (
                      <TableRow key={booking.id.toString()}>
                        <TableCell className="font-mono text-sm">
                          #{booking.id.toString()}
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
                            <Button
                              size="sm"
                              onClick={() => handleConfirmBooking(booking.id)}
                              disabled={updateStatus.isPending || cancelBooking.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelClick(booking.id)}
                              disabled={updateStatus.isPending || cancelBooking.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <BookingDetailsDialog booking={booking} showGuestPrincipal />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>
              {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
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
                          {canHotelCancel(booking) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelClick(booking.id)}
                              disabled={updateStatus.isPending || cancelBooking.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                          <BookingDetailsDialog booking={booking} showGuestPrincipal />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone. The guest will be notified of the cancellation.
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
