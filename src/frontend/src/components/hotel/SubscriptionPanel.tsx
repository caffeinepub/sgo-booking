import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ContactPaymentInstructions } from '../payments/ContactPaymentInstructions';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetHotels } from '../../hooks/useQueries';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { SubscriptionStatus } from '../../backend';

export function SubscriptionPanel() {
  const { identity } = useInternetIdentity();
  const { data: hotels } = useGetHotels();

  const myHotel = hotels?.find((h) => h.id.toString() === identity?.getPrincipal().toString());
  const isActive = myHotel?.active || false;
  const subscriptionStatus = myHotel?.subscriptionStatus;

  const getStatusDisplay = () => {
    if (!myHotel) {
      return {
        icon: <XCircle className="h-6 w-6 text-destructive" />,
        badge: <Badge variant="destructive">Not Found</Badge>,
        message: 'Hotel profile not found',
      };
    }

    if (subscriptionStatus === SubscriptionStatus.test) {
      return {
        icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        badge: <Badge variant="secondary">TEST/DUMMY</Badge>,
        message: 'This is a test hotel. It is hidden from guests even if active.',
      };
    }

    if (!isActive) {
      return {
        icon: <XCircle className="h-6 w-6 text-destructive" />,
        badge: <Badge variant="destructive">Inactive</Badge>,
        message: 'Your hotel is hidden from guests. Contact admin to activate.',
      };
    }

    if (subscriptionStatus === SubscriptionStatus.unpaid) {
      return {
        icon: <XCircle className="h-6 w-6 text-destructive" />,
        badge: <Badge variant="destructive">Unpaid</Badge>,
        message: 'Your subscription is unpaid. Your hotel is hidden from guests and cannot receive bookings. Complete payment to activate.',
      };
    }

    if (subscriptionStatus === SubscriptionStatus.paid) {
      return {
        icon: <CheckCircle className="h-6 w-6 text-green-600" />,
        badge: <Badge variant="default" className="bg-green-600">Active & Paid</Badge>,
        message: 'Your hotel is visible to guests and can receive bookings',
      };
    }

    return {
      icon: <XCircle className="h-6 w-6 text-destructive" />,
      badge: <Badge variant="secondary">Unknown</Badge>,
      message: 'Status unknown',
    };
  };

  const status = getStatusDisplay();
  const showPaymentInstructions = !isActive || subscriptionStatus === SubscriptionStatus.unpaid;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Your hotel listing subscription and visibility status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {status.icon}
            <div>
              {status.badge}
              <p className="text-sm text-muted-foreground mt-1">{status.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPaymentInstructions && <ContactPaymentInstructions />}
    </div>
  );
}
