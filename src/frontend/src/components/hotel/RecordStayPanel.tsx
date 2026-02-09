import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle } from 'lucide-react';

export function RecordStayPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Record Stays
        </CardTitle>
        <CardDescription>Mark completed stays for your guests</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertDescription>
            Stay recording functionality is currently unavailable. This feature will be available once the backend booking system is implemented.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
