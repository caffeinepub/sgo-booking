import React, { useState } from 'react';
import { useGetCallerHotelProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Building2, AlertCircle, Home, User } from 'lucide-react';
import { HotelProfilePanel } from '../components/hotel/HotelProfilePanel';
import { RoomsPanel } from '../components/hotel/RoomsPanel';
import { HotelPaymentMethodsPanel } from '../components/hotel/HotelPaymentMethodsPanel';
import { HotelBookingsPanel } from '../components/hotel/HotelBookingsPanel';
import { RecordStayPanel } from '../components/hotel/RecordStayPanel';
import { SubscriptionPanel } from '../components/hotel/SubscriptionPanel';
import { useNavigate } from '@tanstack/react-router';

export function HotelAreaPage() {
  const { data: hotelProfile, isLoading, isError } = useGetCallerHotelProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading hotel profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !hotelProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Hotel Profile Not Found</CardTitle>
            </div>
            <CardDescription>
              Unable to load your hotel profile. This may be because your account is not yet activated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Issue</AlertTitle>
              <AlertDescription>
                Your hotel account may not be properly activated. Please contact an administrator or check your account status.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => navigate({ to: '/account' })} variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                View Account Status
              </Button>
              <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="stays">Record Stays</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <HotelProfilePanel />
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <RoomsPanel />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <HotelPaymentMethodsPanel />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <HotelBookingsPanel />
        </TabsContent>

        <TabsContent value="stays" className="space-y-6">
          <RecordStayPanel />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
