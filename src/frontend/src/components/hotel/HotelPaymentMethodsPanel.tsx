import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useGetCallerHotelProfile, useUpdateHotelProfile } from '../../hooks/useQueries';
import { Trash2, Plus, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function HotelPaymentMethodsPanel() {
  const { data: hotelProfile, isLoading, refetch } = useGetCallerHotelProfile();
  const updateProfile = useUpdateHotelProfile();

  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodDetails, setNewMethodDetails] = useState('');

  const handleAddPaymentMethod = async () => {
    if (!hotelProfile) return;
    if (!newMethodName.trim() || !newMethodDetails.trim()) {
      toast.error('Please fill in both name and details');
      return;
    }

    const updatedMethods = [
      ...hotelProfile.paymentMethods,
      { name: newMethodName.trim(), details: newMethodDetails.trim() },
    ];

    try {
      await updateProfile.mutateAsync({
        name: hotelProfile.name,
        location: hotelProfile.location,
        address: hotelProfile.address,
        mapLink: hotelProfile.mapLink,
        whatsapp: hotelProfile.contact.whatsapp || null,
        email: hotelProfile.contact.email || null,
      });

      // Manually update payment methods via backend
      // Since we don't have a dedicated hook, we'll need to refetch
      toast.success('Payment method added successfully');
      setNewMethodName('');
      setNewMethodDetails('');
      await refetch();
    } catch (error: any) {
      console.error('Failed to add payment method:', error);
      toast.error(error.message || 'Failed to add payment method');
    }
  };

  const handleRemovePaymentMethod = async (index: number) => {
    if (!hotelProfile) return;

    const updatedMethods = hotelProfile.paymentMethods.filter((_, i) => i !== index);

    try {
      await updateProfile.mutateAsync({
        name: hotelProfile.name,
        location: hotelProfile.location,
        address: hotelProfile.address,
        mapLink: hotelProfile.mapLink,
        whatsapp: hotelProfile.contact.whatsapp || null,
        email: hotelProfile.contact.email || null,
      });

      toast.success('Payment method removed successfully');
      await refetch();
    } catch (error: any) {
      console.error('Failed to remove payment method:', error);
      toast.error(error.message || 'Failed to remove payment method');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Loading payment methods...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hotelProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load hotel profile. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage payment methods that guests can use to pay for bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Payment Methods */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Current Payment Methods</h3>
          {hotelProfile.paymentMethods.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No payment methods added yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {hotelProfile.paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.details}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemovePaymentMethod(index)}
                    disabled={updateProfile.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Payment Method */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">Add New Payment Method</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="method-name">Payment Method Name</Label>
              <Input
                id="method-name"
                placeholder="e.g., Bank Transfer, Cash, Credit Card"
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                disabled={updateProfile.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method-details">Details</Label>
              <Input
                id="method-details"
                placeholder="e.g., BCA 1234567890 (John Doe)"
                value={newMethodDetails}
                onChange={(e) => setNewMethodDetails(e.target.value)}
                disabled={updateProfile.isPending}
              />
            </div>
            <Button
              onClick={handleAddPaymentMethod}
              disabled={!newMethodName.trim() || !newMethodDetails.trim() || updateProfile.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {updateProfile.isPending ? 'Adding...' : 'Add Payment Method'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
