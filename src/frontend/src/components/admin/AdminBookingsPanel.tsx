import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { useGetBookings, useGetHotels } from '../../hooks/useQueries';
import { BookingStatusBadge } from '../booking/BookingStatusBadge';
import { BookingDetailsDialog } from '../booking/BookingDetailsDialog';
import { formatMoney } from '../../utils/money';
import { Calendar, Users, Hotel, AlertCircle } from 'lucide-react';

export function AdminBookingsPanel() {
  const { data: bookingResult, isLoading, error } = useGetBookings();
  const { data: hotels } = useGetHotels();

  const bookings = bookingResult?.bookings || [];

  const getHotelName = (hotelId: any) => {
    if (!hotelId || !hotels) return 'Unknown Hotel';
    const hotel = hotels.find((h) => h.id.toString() === hotelId.toString());
    return hotel?.name || 'Unknown Hotel';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings Overview</CardTitle>
          <CardDescription>Loading all bookings...</CardDescription>
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
          <CardTitle>Bookings Overview</CardTitle>
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
          <CardTitle>Bookings Overview</CardTitle>
          <CardDescription>No bookings in the system yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Bookings from all hotels will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings Overview</CardTitle>
        <CardDescription>
          {bookings.length} total booking{bookings.length !== 1 ? 's' : ''} across all hotels
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
                    <BookingDetailsDialog booking={booking} showGuestPrincipal />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
