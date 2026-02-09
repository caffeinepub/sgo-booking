import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useGetCallerHotelProfile } from '../../hooks/useQueries';
import { SubscriptionStatus } from '../../types/extended-backend';
import { ContactPaymentInstructions } from '../payments/ContactPaymentInstructions';

export function SubscriptionPanel() {
  const { data: hotelProfile, isLoading } = useGetCallerHotelProfile();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading subscription status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const subscriptionStatus = hotelProfile?.subscriptionStatus || SubscriptionStatus.unpaid;
  const isActive = hotelProfile?.active || false;

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case SubscriptionStatus.paid:
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </Badge>
        );
      case SubscriptionStatus.test:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Test Mode
          </Badge>
        );
      case SubscriptionStatus.unpaid:
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Unpaid
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (subscriptionStatus === SubscriptionStatus.paid && isActive) {
      return {
        variant: 'default' as const,
        icon: <CheckCircle2 className="h-4 w-4" />,
        title: 'Subscription Active',
        description: 'Your hotel subscription is active and your hotel is visible to guests.',
      };
    }

    if (subscriptionStatus === SubscriptionStatus.test) {
      return {
        variant: 'default' as const,
        icon: <Clock className="h-4 w-4" />,
        title: 'Test Mode',
        description: 'Your hotel is in test mode. Contact admin to activate your subscription.',
      };
    }

    return {
      variant: 'destructive' as const,
      icon: <AlertCircle className="h-4 w-4" />,
      title: 'Subscription Required',
      description: 'Your subscription is not active. Please contact the administrator to activate your subscription.',
    };
  };

  const statusMessage = getStatusMessage();
  const showContactCard = subscriptionStatus !== SubscriptionStatus.paid || !isActive;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Status</CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription>Manage your hotel subscription and visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={statusMessage.variant}>
            {statusMessage.icon}
            <AlertTitle>{statusMessage.title}</AlertTitle>
            <AlertDescription>{statusMessage.description}</AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Subscription Status</p>
              <p className="font-medium capitalize">{subscriptionStatus}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Hotel Visibility</p>
              <p className="font-medium">{isActive ? 'Visible' : 'Hidden'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showContactCard && <ContactPaymentInstructions />}
    </div>
  );
}
