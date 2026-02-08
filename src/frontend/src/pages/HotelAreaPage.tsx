import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { HotelProfilePanel } from '../components/hotel/HotelProfilePanel';
import { RoomsPanel } from '../components/hotel/RoomsPanel';
import { HotelBookingsPanel } from '../components/hotel/HotelBookingsPanel';
import { RecordStayPanel } from '../components/hotel/RecordStayPanel';
import { SubscriptionPanel } from '../components/hotel/SubscriptionPanel';
import { HotelPaymentMethodsPanel } from '../components/hotel/HotelPaymentMethodsPanel';
import { useGetCallerHotelProfile } from '../hooks/useQueries';
import { Building2, AlertCircle } from 'lucide-react';

export function HotelAreaPage() {
  const { data: hotelProfile, isLoading } = useGetCallerHotelProfile();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading hotel profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotelProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-8 w-8 text-amber-500" />
              <CardTitle>Hotel Profile Not Found</CardTitle>
            </div>
            <CardDescription>
              Your hotel profile could not be loaded. Please ensure you have completed the activation process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact support or try logging out and back in.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Hotel Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your hotel profile, rooms, bookings, and subscription
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="stays">Record Stays</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
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
