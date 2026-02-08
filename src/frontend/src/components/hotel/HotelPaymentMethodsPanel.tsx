import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useGetCallerHotelProfile, useAddPaymentMethod, useRemovePaymentMethod } from '../../hooks/useQueries';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../ui/alert';

export function HotelPaymentMethodsPanel() {
  const { data: hotelProfile, isLoading } = useGetCallerHotelProfile();
  const addPaymentMethod = useAddPaymentMethod();
  const removePaymentMethod = useRemovePaymentMethod();

  const [methodName, setMethodName] = useState('');
  const [methodDetails, setMethodDetails] = useState('');

  const paymentMethods = hotelProfile?.paymentMethods || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!methodName.trim() || !methodDetails.trim()) {
      toast.error('Please fill in both name and details');
      return;
    }

    try {
      await addPaymentMethod.mutateAsync({ name: methodName.trim(), details: methodDetails.trim() });
      toast.success('Payment method added successfully');
      setMethodName('');
      setMethodDetails('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add payment method');
    }
  };

  const handleRemove = async (index: number) => {
    try {
      await removePaymentMethod.mutateAsync(BigInt(index));
      toast.success('Payment method removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove payment method');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading payment methods...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle>Payment Methods</CardTitle>
        </div>
        <CardDescription>
          Manage payment methods that guests will see when booking your hotel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Add payment methods (e.g., bank transfer, e-wallet, PayPal) so guests know how to pay for their bookings.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleAdd} className="space-y-4 border rounded-lg p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="methodName">Payment Method Name</Label>
              <Input
                id="methodName"
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
                placeholder="e.g., Bank Transfer, GoPay, PayPal"
                required
              />
            </div>
            <div>
              <Label htmlFor="methodDetails">Details</Label>
              <Input
                id="methodDetails"
                value={methodDetails}
                onChange={(e) => setMethodDetails(e.target.value)}
                placeholder="e.g., Account number, email, phone"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={addPaymentMethod.isPending} className="gap-2">
            <Plus className="h-4 w-4" />
            {addPaymentMethod.isPending ? 'Adding...' : 'Add Payment Method'}
          </Button>
        </form>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No payment methods configured yet</p>
            <p className="text-sm mt-1">Add your first payment method above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell className="text-muted-foreground">{method.details}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(index)}
                        disabled={removePaymentMethod.isPending}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
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
