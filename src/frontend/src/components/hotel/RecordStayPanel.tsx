import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useGetBookings, useRecordStayCompletion, useGetCallerHotelProfile } from '../../hooks/useQueries';
import { BookingStatusBadge } from '../booking/BookingStatusBadge';
import { formatMoney } from '../../utils/money';
import { toast } from 'sonner';
import { BookingStatus } from '../../types/extended-backend';

export function RecordStayPanel() {
  const { data: hotelProfile } = useGetCallerHotelProfile();
  const { data: bookingsResult, isLoading } = useGetBookings({
    hotelId: hotelProfile?.id || null,
    status: BookingStatus.booked,
  });
  const recordStay = useRecordStayCompletion();

  const bookings = bookingsResult?.bookings || [];
  const eligibleBookings = bookings.filter((booking) => {
    const checkOutDate = new Date(Number(booking.checkOut) / 1000000);
    const now = new Date();
    return checkOutDate <= now && booking.status === BookingStatus.booked;
  });

  const handleRecordStay = async (bookingId: bigint) => {
    try {
      await recordStay.mutateAsync(bookingId);
      toast.success('Stay completion recorded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to record stay completion');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Stay Completion</CardTitle>
        <CardDescription>Mark completed stays for bookings that have passed their check-out date</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading eligible bookings...</p>
          </div>
        ) : eligibleBookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No eligible bookings to record</p>
            <p className="text-sm mt-1">Bookings appear here after their check-out date has passed</p>
          </div>
        ) : (
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
                {eligibleBookings.map((booking) => (
                  <TableRow key={booking.id.toString()}>
                    <TableCell className="font-mono text-sm">#{booking.id.toString()}</TableCell>
                    <TableCell>{new Date(Number(booking.checkIn) / 1000000).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(Number(booking.checkOut) / 1000000).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.guests.toString()}</TableCell>
                    <TableCell className="font-semibold">{formatMoney(booking.totalPrice, booking.currency)}</TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleRecordStay(booking.id)}
                        disabled={recordStay.isPending}
                      >
                        {recordStay.isPending ? 'Recording...' : 'Record Completion'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
