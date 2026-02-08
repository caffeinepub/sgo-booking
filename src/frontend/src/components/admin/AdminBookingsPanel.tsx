import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useGetBookings } from '../../hooks/useQueries';
import { BookingStatusBadge } from '../booking/BookingStatusBadge';
import { BookingDetailsDialog } from '../booking/BookingDetailsDialog';
import { formatMoney } from '../../utils/money';

export function AdminBookingsPanel() {
  const { data: bookingsResult, isLoading } = useGetBookings({});

  const bookings = bookingsResult?.bookings || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings Overview</CardTitle>
        <CardDescription>View and manage all bookings across all hotels</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Hotel ID</TableHead>
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
                    <TableCell className="font-mono text-sm">#{booking.id.toString()}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[100px]">
                      {booking.hotelId?.toString() || 'N/A'}
                    </TableCell>
                    <TableCell>{new Date(Number(booking.checkIn) / 1000000).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(Number(booking.checkOut) / 1000000).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.guests.toString()}</TableCell>
                    <TableCell className="font-semibold">{formatMoney(booking.totalPrice, booking.currency)}</TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <BookingDetailsDialog booking={booking} showGuestPrincipal={true} />
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
