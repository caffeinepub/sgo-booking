import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useAdminGetAllHotels, useAdminToggleHotelActivation, useAdminUpdateHotelSubscription } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';

export function HotelVisibilityPanel() {
  const { data: hotels, isLoading } = useAdminGetAllHotels();
  const toggleActivation = useAdminToggleHotelActivation();
  const updateSubscription = useAdminUpdateHotelSubscription();

  const handleToggleActive = async (hotelId: any, currentStatus: boolean) => {
    try {
      await toggleActivation.mutateAsync({
        hotelId,
        activate: !currentStatus,
      });
      toast.success(`Hotel ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hotel status');
    }
  };

  const handleSubscriptionChange = async (hotelId: any, status: string) => {
    try {
      await updateSubscription.mutateAsync({
        hotelId,
        status,
      });
      toast.success('Subscription status updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update subscription status');
    }
  };

  const getSubscriptionBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    if (status === 'paid') return 'default';
    if (status === 'unpaid') return 'destructive';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Building2 className="h-6 w-6 text-primary" />
          Hotel Visibility Control
        </CardTitle>
        <CardDescription className="text-base">
          Manage which hotels are visible to guests. Only active hotels with paid or test subscriptions appear in
          browse results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !hotels || hotels.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hotels registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Hotel Name</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Active</TableHead>
                  <TableHead className="font-semibold">Subscription</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => {
                  const subscriptionStatus = hotel.subscriptionStatus;
                  return (
                    <TableRow key={hotel.id.toString()}>
                      <TableCell className="font-medium">{hotel.name}</TableCell>
                      <TableCell>{hotel.location}</TableCell>
                      <TableCell>
                        <Badge variant={hotel.active ? 'default' : 'secondary'}>
                          {hotel.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSubscriptionBadgeVariant(subscriptionStatus)}>
                            {subscriptionStatus === 'paid' ? 'Paid' : subscriptionStatus === 'unpaid' ? 'Unpaid' : 'Test'}
                          </Badge>
                          <Select
                            value={subscriptionStatus}
                            onValueChange={(value) => handleSubscriptionChange(hotel.id, value)}
                            disabled={updateSubscription.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                              <SelectItem value="test">Test</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={hotel.active ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleToggleActive(hotel.id, hotel.active)}
                          disabled={toggleActivation.isPending}
                        >
                          {hotel.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
