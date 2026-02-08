import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useGetHotels, useSetHotelActiveStatus, useSetHotelSubscriptionStatus } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { SubscriptionStatus } from '../../backend';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export function HotelVisibilityPanel() {
  const { data: hotels, isLoading } = useGetHotels();
  const setActiveStatus = useSetHotelActiveStatus();
  const setSubscriptionStatus = useSetHotelSubscriptionStatus();

  const handleToggleActive = async (hotelId: any, currentStatus: boolean) => {
    try {
      await setActiveStatus.mutateAsync({
        hotelId,
        active: !currentStatus,
      });
      toast.success(`Hotel ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hotel status');
    }
  };

  const handleSetSubscriptionStatus = async (hotelId: any, status: SubscriptionStatus) => {
    try {
      await setSubscriptionStatus.mutateAsync({ hotelId, status });
      toast.success(`Subscription status updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update subscription status');
    }
  };

  const getSubscriptionBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.paid:
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case SubscriptionStatus.unpaid:
        return <Badge variant="destructive">Unpaid</Badge>;
      case SubscriptionStatus.test:
        return <Badge variant="secondary">TEST</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Visibility & Subscription Management</CardTitle>
        <CardDescription>Control which hotels are visible to guests and manage subscription status</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading hotels...</p>
          </div>
        ) : !hotels || hotels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hotels registered yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">How it works:</p>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>
                      <strong>Active/Inactive:</strong> Only active hotels appear in guest browse. Deactivate to hide from guests.
                    </li>
                    <li>
                      <strong>Paid/Unpaid:</strong> Monthly subscription status. Unpaid hotels are hidden from guests and cannot be booked.
                    </li>
                    <li>
                      <strong>TEST/DUMMY:</strong> Mark example hotels as TEST. TEST hotels are hidden from guests even if active.
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotels.map((hotel) => (
                    <TableRow key={hotel.id.toString()}>
                      <TableCell className="font-medium">{hotel.name}</TableCell>
                      <TableCell>{hotel.location}</TableCell>
                      <TableCell>
                        <Switch
                          checked={hotel.active}
                          onCheckedChange={() => handleToggleActive(hotel.id, hotel.active)}
                          disabled={setActiveStatus.isPending}
                        />
                      </TableCell>
                      <TableCell>{getSubscriptionBadge(hotel.subscriptionStatus)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetSubscriptionStatus(hotel.id, SubscriptionStatus.paid)}
                            disabled={setSubscriptionStatus.isPending || hotel.subscriptionStatus === SubscriptionStatus.paid}
                          >
                            Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetSubscriptionStatus(hotel.id, SubscriptionStatus.unpaid)}
                            disabled={setSubscriptionStatus.isPending || hotel.subscriptionStatus === SubscriptionStatus.unpaid}
                          >
                            Mark Unpaid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetSubscriptionStatus(hotel.id, SubscriptionStatus.test)}
                            disabled={setSubscriptionStatus.isPending || hotel.subscriptionStatus === SubscriptionStatus.test}
                          >
                            Mark as TEST
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
