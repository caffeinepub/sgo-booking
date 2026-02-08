import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useGetHotels, useSetHotelActiveStatus, useSetHotelSubscriptionStatus } from '../../hooks/useQueries';
import { SubscriptionStatus } from '../../types/extended-backend';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
      toast.error(`Failed to update hotel status: ${error.message}`);
    }
  };

  const handleSubscriptionChange = async (hotelId: any, status: SubscriptionStatus) => {
    try {
      await setSubscriptionStatus.mutateAsync({
        hotelId,
        status,
      });
      toast.success('Subscription status updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update subscription: ${error.message}`);
    }
  };

  const getSubscriptionBadge = (status: SubscriptionStatus) => {
    switch (status) {
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
            Test
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Visibility Control</CardTitle>
        <CardDescription>
          Manage which hotels are visible to guests. Only active hotels with Paid or TEST subscription appear in
          Browse Hotels.
        </CardDescription>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id.toString()}>
                    <TableCell className="font-medium">{hotel.name}</TableCell>
                    <TableCell>{hotel.location}</TableCell>
                    <TableCell>
                      <Select
                        value={hotel.subscriptionStatus}
                        onValueChange={(value) =>
                          handleSubscriptionChange(hotel.id, value as SubscriptionStatus)
                        }
                        disabled={setSubscriptionStatus.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SubscriptionStatus.paid}>Paid</SelectItem>
                          <SelectItem value={SubscriptionStatus.unpaid}>Unpaid</SelectItem>
                          <SelectItem value={SubscriptionStatus.test}>Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {hotel.active ? (
                        <Badge variant="default" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <EyeOff className="h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={hotel.active ? 'outline' : 'default'}
                        onClick={() => handleToggleActive(hotel.id, hotel.active)}
                        disabled={setActiveStatus.isPending}
                      >
                        {hotel.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
