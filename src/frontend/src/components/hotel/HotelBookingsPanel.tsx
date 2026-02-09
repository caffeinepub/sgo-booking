import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar } from 'lucide-react';

export function HotelBookingsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Bookings
        </CardTitle>
        <CardDescription>View and manage bookings for your hotel</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertDescription>
            Booking functionality is currently unavailable. This feature will be available once the backend booking system is implemented.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
