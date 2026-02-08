import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useGetBookings, useRecordStayCompletion } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { BookingStatusBadge } from '../booking/BookingStatusBadge';
import { formatMoney } from '../../utils/money';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import { BookingStatus } from '../../types/extended-backend';

export function RecordStayPanel() {
  const { identity } = useInternetIdentity();
  const { data: bookingsResult, isLoading } = useGetBookings({
    hotelId: identity?.getPrincipal() as any as Principal,
  });
  const recordStay = useRecordStayCompletion();

  const bookings = bookingsResult?.bookings || [];
  const eligibleBookings = bookings.filter(
    (b) => b.status === BookingStatus.booked || b.status === BookingStatus.checkedIn
  );

  const handleRecordStay = async (bookingId: bigint) => {
    try {
      await recordStay.mutateAsync(bookingId);
      toast.success('Stay completion recorded successfully');
    } catch (error: any) {
      toast.error(`Failed to record stay: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Stay Completion</CardTitle>
        <CardDescription>Mark bookings as completed after guest checkout</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading bookings...</p>
          </div>
        ) : eligibleBookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No eligible bookings to complete</p>
            <p className="text-sm mt-2">Only booked or checked-in bookings can be marked as completed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
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
                        Mark Completed
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
