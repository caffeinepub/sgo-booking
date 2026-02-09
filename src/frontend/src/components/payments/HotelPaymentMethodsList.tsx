import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { CreditCard, MessageCircle, Mail } from 'lucide-react';
import type { PaymentMethod, HotelContact } from '../../backend';

interface HotelPaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  contact: HotelContact;
  hotelName: string;
}

export function HotelPaymentMethodsList({ paymentMethods, contact, hotelName }: HotelPaymentMethodsListProps) {
  const hasPaymentMethods = paymentMethods && paymentMethods.length > 0;
  const hasWhatsApp = contact?.whatsapp;
  const hasEmail = contact?.email;
  const hasAnyContact = hasWhatsApp || hasEmail;

  if (!hasPaymentMethods && !hasAnyContact) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment & Contact Information</CardTitle>
        <CardDescription>
          Payment methods and contact details for {hotelName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasPaymentMethods && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Accepted Payment Methods
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{method.name}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {method.details}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {hasAnyContact && (
          <>
            {hasPaymentMethods && <Separator />}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Hotel</h3>
              <div className="flex flex-col gap-2">
                {hasWhatsApp && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp: {contact.whatsapp}
                    </a>
                  </Button>
                )}
                {hasEmail && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={`mailto:${contact.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email: {contact.email}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
