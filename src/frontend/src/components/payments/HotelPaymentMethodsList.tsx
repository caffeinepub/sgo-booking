import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { PaymentMethod, HotelContact } from '../../backend';
import { Button } from '../ui/button';
import { CreditCard, MessageCircle, Mail } from 'lucide-react';

interface HotelPaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  contact: HotelContact;
  hotelName: string;
}

export function HotelPaymentMethodsList({ paymentMethods, contact, hotelName }: HotelPaymentMethodsListProps) {
  const handleWhatsApp = () => {
    if (contact.whatsapp) {
      window.open(`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (contact.email) {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Available payment options for {hotelName}</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment methods configured yet</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{method.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(contact.whatsapp || contact.email) && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Hotel</CardTitle>
            <CardDescription>Get in touch with {hotelName} for payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {contact.whatsapp && (
              <Button onClick={handleWhatsApp} variant="outline" className="w-full gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact via WhatsApp
              </Button>
            )}
            {contact.email && (
              <Button onClick={handleEmail} variant="outline" className="w-full gap-2">
                <Mail className="h-4 w-4" />
                Email Hotel
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
