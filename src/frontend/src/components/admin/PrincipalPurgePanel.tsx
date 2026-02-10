import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useAdminPurgePrincipalData } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';

export function PrincipalPurgePanel() {
  const purgeMutation = useAdminPurgePrincipalData();
  const [principalInput, setPrincipalInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [principalError, setPrincipalError] = useState('');

  const validatePrincipal = (value: string): boolean => {
    if (!value.trim()) {
      setPrincipalError('Principal ID is required');
      return false;
    }

    try {
      Principal.fromText(value.trim());
      setPrincipalError('');
      return true;
    } catch (error) {
      setPrincipalError('Invalid Principal format');
      return false;
    }
  };

  const handlePrincipalChange = (value: string) => {
    setPrincipalInput(value);
    if (value.trim()) {
      validatePrincipal(value);
    } else {
      setPrincipalError('');
    }
  };

  const handlePurge = async () => {
    if (!validatePrincipal(principalInput)) {
      return;
    }

    if (confirmInput !== principalInput.trim()) {
      toast.error('Confirmation does not match. Please type the exact Principal ID.');
      return;
    }

    try {
      const principal = Principal.fromText(principalInput.trim());
      await purgeMutation.mutateAsync(principal);
      toast.success('Principal data purged successfully');
      setPrincipalInput('');
      setConfirmInput('');
      setPrincipalError('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to purge principal data');
    }
  };

  const canPurge = principalInput.trim() && confirmInput === principalInput.trim() && !principalError;

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Purge Principal Data
        </CardTitle>
        <CardDescription>
          Permanently delete all data associated with a specific Principal ID (hotel profile, rooms, bookings)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action is irreversible. All hotel data, rooms, and bookings associated with
            this Principal will be permanently deleted.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label htmlFor="principalId">
              Principal ID to Purge <span className="text-destructive">*</span>
            </Label>
            <Input
              id="principalId"
              value={principalInput}
              onChange={(e) => handlePrincipalChange(e.target.value)}
              placeholder="e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              className={principalError ? 'border-destructive' : ''}
            />
            {principalError && <p className="text-sm text-destructive mt-1">{principalError}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPrincipal">
              Type Principal ID again to confirm <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirmPrincipal"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Confirm by typing the Principal ID"
            />
          </div>

          <Button
            variant="destructive"
            onClick={handlePurge}
            disabled={!canPurge || purgeMutation.isPending}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {purgeMutation.isPending ? 'Purging...' : 'Purge All Data for This Principal'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
