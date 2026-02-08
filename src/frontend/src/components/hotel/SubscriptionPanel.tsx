import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useGetCallerHotelProfile } from '../../hooks/useQueries';
import { SubscriptionStatus } from '../../types/extended-backend';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
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

  if (!hotelProfile) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Hotel profile not found</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (hotelProfile.subscriptionStatus) {
      case SubscriptionStatus.paid:
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Paid
          </Badge>
        );
      case SubscriptionStatus.unpaid:
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Unpaid
          </Badge>
        );
      case SubscriptionStatus.test:
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Test Mode
          </Badge>
        );
    }
  };

  const showContactCard =
    !hotelProfile.active || hotelProfile.subscriptionStatus === SubscriptionStatus.unpaid;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Your current subscription and hotel activation status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Hotel Status</p>
              {hotelProfile.active ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Inactive
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Subscription</p>
              {getStatusBadge()}
            </div>
          </div>

          {hotelProfile.active && hotelProfile.subscriptionStatus === SubscriptionStatus.paid && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>All Set!</AlertTitle>
              <AlertDescription>
                Your hotel is active and your subscription is paid. Your hotel is visible to guests.
              </AlertDescription>
            </Alert>
          )}

          {hotelProfile.subscriptionStatus === SubscriptionStatus.test && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Test Mode</AlertTitle>
              <AlertDescription>
                Your hotel is in test mode. It may be visible to guests for testing purposes.
              </AlertDescription>
            </Alert>
          )}

          {!hotelProfile.active && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Hotel Inactive</AlertTitle>
              <AlertDescription>
                Your hotel is currently inactive and not visible to guests. Contact admin for activation.
              </AlertDescription>
            </Alert>
          )}

          {hotelProfile.subscriptionStatus === SubscriptionStatus.unpaid && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Subscription Unpaid</AlertTitle>
              <AlertDescription>
                Your subscription is unpaid. Please contact admin to update your subscription status.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showContactCard && <ContactPaymentInstructions />}
    </div>
  );
}
