import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Phone, Mail } from 'lucide-react';
import type { HotelDataView } from '../../types/extended-backend';

interface HotelPaymentMethodsListProps {
  hotel: HotelDataView;
}

export function HotelPaymentMethodsList({ hotel }: HotelPaymentMethodsListProps) {
  const handleWhatsAppClick = () => {
    if (hotel.contact.whatsapp) {
      const cleanNumber = hotel.contact.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const handleEmailClick = () => {
    if (hotel.contact.email) {
      window.location.href = `mailto:${hotel.contact.email}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Available payment options for this hotel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hotel.paymentMethods && hotel.paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {hotel.paymentMethods.map((method, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <p className="font-semibold">{method.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{method.details}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No payment methods listed. Please contact the hotel directly.
          </p>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Contact Hotel</p>
          <div className="flex flex-col gap-2">
            {hotel.contact.whatsapp && (
              <Button variant="outline" className="w-full justify-start" onClick={handleWhatsAppClick}>
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp: {hotel.contact.whatsapp}
              </Button>
            )}
            {hotel.contact.email && (
              <Button variant="outline" className="w-full justify-start" onClick={handleEmailClick}>
                <Mail className="h-4 w-4 mr-2" />
                {hotel.contact.email}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
