import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CreditCard } from 'lucide-react';

export function HotelPaymentMethodsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Methods
        </CardTitle>
        <CardDescription>Manage payment methods for your hotel</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertDescription>
            Payment method management is currently unavailable. This feature will be available once the backend payment system is implemented.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
