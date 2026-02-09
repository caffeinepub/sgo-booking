import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

export function BookingForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Room</CardTitle>
        <CardDescription>Booking functionality coming soon</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Booking functionality is currently unavailable. Please contact the hotel directly using the contact information provided.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
