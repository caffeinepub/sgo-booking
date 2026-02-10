import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Building2, Bed, CreditCard, Calendar, ClipboardCheck, Crown, AlertCircle } from 'lucide-react';
import { HotelProfilePanel } from '../components/hotel/HotelProfilePanel';
import { RoomsPanel } from '../components/hotel/RoomsPanel';
import { HotelPaymentMethodsPanel } from '../components/hotel/HotelPaymentMethodsPanel';
import { HotelBookingsPanel } from '../components/hotel/HotelBookingsPanel';
import { RecordStayPanel } from '../components/hotel/RecordStayPanel';
import { SubscriptionPanel } from '../components/hotel/SubscriptionPanel';
import { useGetCallerHotelProfile, useIsCurrentUserAdmin } from '../hooks/useQueries';

export function HotelAreaPage() {
  const { data: hotelProfile, isLoading: profileLoading, error: profileError } = useGetCallerHotelProfile();
  const { data: isAdmin } = useIsCurrentUserAdmin();

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading hotel profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load hotel profile. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hotelProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Hotel Profile Not Found
            </CardTitle>
            <CardDescription>
              Your hotel account has not been activated yet. Please contact an administrator for an invite token.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isDeactivated = !hotelProfile.active && !isAdmin;

  if (isDeactivated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your hotel account has been deactivated by an administrator. Please contact support for assistance.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Hotel Management Area
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your hotel profile, rooms, bookings, and more
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <Bed className="h-4 w-4" />
            <span className="hidden sm:inline">Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="stays" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Record Stays</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <HotelProfilePanel />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomsPanel />
        </TabsContent>

        <TabsContent value="payments">
          <HotelPaymentMethodsPanel />
        </TabsContent>

        <TabsContent value="bookings">
          <HotelBookingsPanel />
        </TabsContent>

        <TabsContent value="stays">
          <RecordStayPanel />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
