import React from 'react';
import { useGetBookings } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BookingStatusBadge } from '../components/booking/BookingStatusBadge';
import { BookingDetailsDialog } from '../components/booking/BookingDetailsDialog';
import { Calendar, User } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { formatMoney } from '../utils/money';

export function GuestAccountPage() {
  const { data: bookingsResult, isLoading } = useGetBookings({});
  const navigate = useNavigate();

  const myBookings = bookingsResult?.bookings || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Guest Account</h1>
        <p className="text-muted-foreground">
          Manage your bookings and account
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>My Bookings</CardTitle>
            </div>
            <CardDescription>View and manage your hotel reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/browse' })} className="w-full">
              Browse Hotels
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Account Status</CardTitle>
            </div>
            <CardDescription>View your account details and authentication status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/account-status' })} variant="outline" className="w-full">
              View Account Status
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>
            {myBookings.length === 0
              ? 'You have no bookings yet. Browse hotels to make your first reservation!'
              : `You have ${myBookings.length} booking${myBookings.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading bookings...</p>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No bookings found</p>
              <Button onClick={() => navigate({ to: '/browse' })}>
                Browse Hotels
              </Button>
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
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myBookings.map((booking) => (
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
    </div>
  );
}
