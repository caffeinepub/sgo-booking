import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { useGetCallerHotelProfile, useAddPaymentMethod, useRemovePaymentMethod } from '../../hooks/useQueries';
import { CreditCard, Trash2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function HotelPaymentMethodsPanel() {
  const { data: hotelProfile, isLoading } = useGetCallerHotelProfile();
  const addPaymentMethod = useAddPaymentMethod();
  const removePaymentMethod = useRemovePaymentMethod();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !details.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addPaymentMethod.mutateAsync({ name: name.trim(), details: details.trim() });
      toast.success('Payment method added successfully');
      setName('');
      setDetails('');
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Failed to add payment method:', error);
      toast.error(error.message || 'Failed to add payment method');
    }
  };

  const handleRemovePaymentMethod = async (index: number) => {
    try {
      await removePaymentMethod.mutateAsync(BigInt(index));
      toast.success('Payment method removed successfully');
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

  const paymentMethods = hotelProfile?.paymentMethods || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Manage payment methods for your hotel. Guests will see these options when booking.
            </CardDescription>
          </div>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAddForm && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-lg">Add Payment Method</CardTitle>
              <CardDescription>
                Enter any payment method (e.g., GoPay, DANA, Bank Transfer, Cash)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentName">Payment Method Name</Label>
                  <Input
                    id="paymentName"
                    placeholder="e.g., GoPay, Bank Transfer, Cash"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDetails">Details</Label>
                  <Textarea
                    id="paymentDetails"
                    placeholder="e.g., Account number, phone number, instructions..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={addPaymentMethod.isPending}
                  >
                    {addPaymentMethod.isPending ? 'Adding...' : 'Add Payment Method'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setName('');
                      setDetails('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                {addPaymentMethod.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {addPaymentMethod.error.message || 'Failed to add payment method'}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No payment methods added yet
            </p>
            <p className="text-sm text-muted-foreground">
              Add payment methods so guests know how to pay for their bookings
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold">Current Payment Methods</h3>
            {paymentMethods.map((method, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">{method.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {method.details}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePaymentMethod(index)}
                      disabled={removePaymentMethod.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Separator />

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Payment methods are flexible and not restricted to specific providers.
            You can add any payment method that works in your region (digital wallets, bank transfers, cash, etc.).
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
