import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PaymentMethod, HotelContact } from '../../backend';
import { CreditCard, AlertCircle, MessageCircle, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

interface HotelPaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  hotelName?: string;
  hotelContact?: HotelContact;
}

export function HotelPaymentMethodsList({ paymentMethods, hotelName, hotelContact }: HotelPaymentMethodsListProps) {
  const hasContact = hotelContact && (hotelContact.whatsapp || hotelContact.email);

  const handleWhatsApp = () => {
    if (hotelContact?.whatsapp) {
      window.open(`https://wa.me/${hotelContact.whatsapp}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (hotelContact?.email) {
      window.location.href = `mailto:${hotelContact.email}`;
    }
  };

  if (paymentMethods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <CardTitle>Payment Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              This hotel has not provided payment methods yet. Please contact the hotel directly for payment instructions.
            </AlertDescription>
          </Alert>
          {hasContact && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium">Contact Hotel:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hotelContact.whatsapp && (
                  <Button onClick={handleWhatsApp} variant="outline" className="gap-2 h-auto py-3">
                    <MessageCircle className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">WhatsApp</div>
                      <div className="text-xs opacity-70">{hotelContact.whatsapp}</div>
                    </div>
                  </Button>
                )}
                {hotelContact.email && (
                  <Button onClick={handleEmail} variant="outline" className="gap-2 h-auto py-3">
                    <Mail className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">Email</div>
                      <div className="text-xs opacity-70">{hotelContact.email}</div>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle>Payment Methods</CardTitle>
        </div>
        <CardDescription>
          {hotelName ? `Payment methods accepted by ${hotelName}` : 'Available payment methods for this hotel'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {paymentMethods.map((method, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-1">
              <div className="font-semibold text-sm">{method.name}</div>
              <div className="text-sm text-muted-foreground">{method.details}</div>
            </div>
          ))}
        </div>

        {hasContact && (
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Contact Hotel for Questions:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hotelContact.whatsapp && (
                <Button onClick={handleWhatsApp} variant="outline" className="gap-2 h-auto py-3">
                  <MessageCircle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">WhatsApp</div>
                    <div className="text-xs opacity-70">{hotelContact.whatsapp}</div>
                  </div>
                </Button>
              )}
              {hotelContact.email && (
                <Button onClick={handleEmail} variant="outline" className="gap-2 h-auto py-3">
                  <Mail className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">Email</div>
                    <div className="text-xs opacity-70">{hotelContact.email}</div>
                  </div>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
