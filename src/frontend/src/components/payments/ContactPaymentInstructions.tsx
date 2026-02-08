import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { MessageCircle, Mail, Info } from 'lucide-react';

/**
 * ContactPaymentInstructions Component
 * 
 * USAGE: This component is ONLY for hotel activation/subscription scenarios.
 * DO NOT use this component for guest booking payment instructions.
 * 
 * For guest payment instructions, use HotelPaymentMethodsList with hotel-specific
 * payment methods and contact information.
 */
export function ContactPaymentInstructions() {
  const whatsappNumber = '089502436075';
  const email = 'sentraguestos.info@gmail.com';

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <CardTitle>Admin Contact (Hotel Activation Only)</CardTitle>
        </div>
        <CardDescription>
          For hotel owners: Contact admin to activate your hotel account or manage subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTitle>Hotel Activation & Subscription</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <p>
              If you are a hotel owner and need to activate your account or renew your monthly subscription, please contact our admin team.
            </p>
            <p className="text-sm">
              This contact information is for hotel activation/subscription only, not for guest bookings.
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button onClick={handleWhatsApp} className="gap-2 h-auto py-3" variant="default">
            <MessageCircle className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">WhatsApp</div>
              <div className="text-xs opacity-90">{whatsappNumber}</div>
            </div>
          </Button>

          <Button onClick={handleEmail} className="gap-2 h-auto py-3" variant="outline">
            <Mail className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Email</div>
              <div className="text-xs opacity-90">{email}</div>
            </div>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Admin Payment Methods (Hotel Activation/Subscription):</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>PayPal: lucky.jamaludin@gmail.com</li>
            <li>GoPay: {whatsappNumber}</li>
            <li>Dana: {whatsappNumber}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
