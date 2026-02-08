import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetBookings, useRecordStayCompletion } from '../../hooks/useQueries';
import { BookingStatusBadge } from '../booking/BookingStatusBadge';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export function RecordStayPanel() {
  const { identity } = useInternetIdentity();
  const { data: bookingsResult, isLoading } = useGetBookings({
    hotelId: identity?.getPrincipal() as any as Principal,
  });
  const recordStay = useRecordStayCompletion();

  const bookings = bookingsResult?.bookings || [];
  const eligibleBookings = bookings.filter(
    (b) => b.status === 'booked' || b.status === 'checkedIn'
  );

  const handleRecordStay = async (bookingId: bigint) => {
    await recordStay.mutateAsync(bookingId);
    toast.success('Stay completion recorded successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Stay</CardTitle>
        <CardDescription>Mark bookings as completed when guests check out</CardDescription>
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
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibleBookings.map((booking) => (
                  <TableRow key={booking.id.toString()}>
                    <TableCell className="font-mono text-sm">#{booking.id.toString()}</TableCell>
                    <TableCell>{new Date(Number(booking.checkIn) / 1000000).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(Number(booking.checkOut) / 1000000).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleRecordStay(booking.id)}
                        disabled={recordStay.isPending}
                        className="gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Complete
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
