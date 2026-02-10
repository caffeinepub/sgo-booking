import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useAdminPurgeHotelData } from '../../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

export function PrincipalPurgePanel() {
  const [principalInput, setPrincipalInput] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const purgeHotelData = useAdminPurgeHotelData();

  const handleInitiatePurge = () => {
    if (!principalInput.trim()) {
      toast.error('Please enter a hotel Principal ID');
      return;
    }

    try {
      Principal.fromText(principalInput.trim());
      setShowConfirmation(true);
    } catch (error) {
      toast.error('Invalid Principal ID format');
    }
  };

  const handleConfirmPurge = async () => {
    if (confirmationInput !== principalInput.trim()) {
      toast.error('Confirmation does not match. Please type the exact Principal ID.');
      return;
    }

    try {
      const principal = Principal.fromText(principalInput.trim());
      await purgeHotelData.mutateAsync(principal);
      toast.success('Hotel data purged successfully');
      setPrincipalInput('');
      setConfirmationInput('');
      setShowConfirmation(false);
    } catch (error: any) {
      console.error('Purge error:', error);
      toast.error(error.message || 'Failed to purge hotel data');
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmationInput('');
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Purge Hotel Data</CardTitle>
        </div>
        <CardDescription>
          Permanently delete all data for a specific hotel Principal ID (profile, rooms, bookings, tokens, activation status)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action is irreversible. All hotel data, rooms, bookings, payment methods, and activation status will be permanently deleted.
          </AlertDescription>
        </Alert>

        {!showConfirmation ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal-input">Hotel Principal ID</Label>
              <Input
                id="principal-input"
                placeholder="e.g., opo7v-ka45k-pk32j-76qsi-o3ngz-e6tgc-755di-t2vx3-t2ugj-qnpbc-gae"
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
                disabled={purgeHotelData.isPending}
              />
            </div>

            <Button
              variant="destructive"
              onClick={handleInitiatePurge}
              disabled={!principalInput.trim() || purgeHotelData.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Initiate Purge
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Confirmation Required:</strong> Type the exact Principal ID below to confirm deletion.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirmation-input">Type Principal ID to confirm</Label>
              <Input
                id="confirmation-input"
                placeholder={principalInput.trim()}
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                disabled={purgeHotelData.isPending}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleConfirmPurge}
                disabled={confirmationInput !== principalInput.trim() || purgeHotelData.isPending}
              >
                {purgeHotelData.isPending ? 'Purging...' : 'Confirm Purge'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={purgeHotelData.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
