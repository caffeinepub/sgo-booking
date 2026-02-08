import React from 'react';
import { MyBookingsTable } from '../components/booking/MyBookingsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, User } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export function MyBookingsPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your hotel reservations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Browse Hotels</CardTitle>
            </div>
            <CardDescription>Find and book your next stay</CardDescription>
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

      <MyBookingsTable />
    </div>
  );
}
