import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Key, CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';
import { useValidateInviteToken, useConsumeInviteToken } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

interface HotelActivationFormProps {
  onSuccess?: () => void;
}

export function HotelActivationForm({ onSuccess }: HotelActivationFormProps) {
  const [token, setToken] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const validateToken = useValidateInviteToken();
  const consumeToken = useConsumeInviteToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleValidate = async () => {
    if (!token.trim()) {
      toast.error('Please enter an invite token');
      return;
    }

    try {
      const isValid = await validateToken.mutateAsync(token.trim());
      setValidationStatus(isValid ? 'valid' : 'invalid');
      if (isValid) {
        toast.success('Token format is valid');
      } else {
        toast.error('Token format is invalid');
      }
    } catch (error: any) {
      setValidationStatus('invalid');
      toast.error(error.message || 'Failed to validate token');
    }
  };

  const handleActivate = async () => {
    if (!token.trim()) {
      toast.error('Please enter an invite token');
      return;
    }

    try {
      await consumeToken.mutateAsync(token.trim());
      
      // Wait for all queries to refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['callerHotelProfile'] }),
        queryClient.refetchQueries({ queryKey: ['hotels'] }),
        queryClient.refetchQueries({ queryKey: ['adminHotels'] }),
        queryClient.refetchQueries({ queryKey: ['isCallerHotelActivated'] }),
        queryClient.refetchQueries({ queryKey: ['callerUserRole'] }),
      ]);

      toast.success('Hotel account activated successfully!');
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to Hotel Area after successful activation
        setTimeout(() => {
          navigate({ to: '/hotel' });
        }, 500);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate hotel account');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Hotel Onboarding
        </CardTitle>
        <CardDescription>
          Activate your hotel account to start managing your property
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationStatus === 'idle' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your account has hotel role but is not yet activated. Enter an invite token from an administrator to activate your hotel account.
            </AlertDescription>
          </Alert>
        )}

        {validationStatus === 'valid' && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Token format is valid
            </AlertDescription>
          </Alert>
        )}

        {validationStatus === 'invalid' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Token format is invalid
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="invite-token">Invite Token</Label>
          <Input
            id="invite-token"
            type="text"
            placeholder="Enter your invite token"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setValidationStatus('idle');
            }}
            disabled={validateToken.isPending || consumeToken.isPending}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={!token.trim() || validateToken.isPending || consumeToken.isPending}
            className="flex-1"
          >
            {validateToken.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate Token'
            )}
          </Button>
          <Button
            onClick={handleActivate}
            disabled={!token.trim() || consumeToken.isPending}
            className="flex-1"
          >
            {consumeToken.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate Hotel'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
