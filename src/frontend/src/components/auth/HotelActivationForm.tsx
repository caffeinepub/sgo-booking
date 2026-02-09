import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Key, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useValidateInviteToken, useConsumeInviteToken } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

interface HotelActivationFormProps {
  onSuccess?: () => void;
}

export function HotelActivationForm({ onSuccess }: HotelActivationFormProps) {
  const [token, setToken] = useState('');
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const validateMutation = useValidateInviteToken();
  const consumeMutation = useConsumeInviteToken();

  const handleTokenChange = (value: string) => {
    setToken(value);
    if (validationResult !== null) {
      setValidationResult(null);
    }
  };

  const handleValidate = async () => {
    if (!token.trim()) {
      toast.error('Please enter an invite token');
      return;
    }

    try {
      const isValid = await validateMutation.mutateAsync(token.trim());
      setValidationResult(isValid);
      if (isValid) {
        toast.success('Token is valid! You can now activate your hotel account.');
      } else {
        toast.error('Invalid or expired token. Please check and try again.');
      }
    } catch (error: any) {
      setValidationResult(false);
      toast.error('Failed to validate token: ' + (error.message || 'Unknown error'));
    }
  };

  const handleActivate = async () => {
    if (!token.trim()) {
      toast.error('Please enter an invite token');
      return;
    }

    try {
      await consumeMutation.mutateAsync(token.trim());
      toast.success('Hotel account activated successfully! Redirecting...');
      
      // Invalidate and refetch all relevant queries
      await queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      await queryClient.invalidateQueries({ queryKey: ['isCurrentUserAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['isCallerHotelActivated'] });
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
      
      // Navigate to hotel area after a short delay
      setTimeout(() => {
        navigate({ to: '/hotel' });
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error: any) {
      toast.error('Activation failed: ' + (error.message || 'Unknown error'));
    }
  };

  const isActivateDisabled = 
    consumeMutation.isPending || 
    !token.trim() || 
    (validationResult !== null && !validationResult);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Key className="h-6 w-6 text-primary" />
          <CardTitle>Activate Hotel Account</CardTitle>
        </div>
        <CardDescription>
          Enter the invite token provided by an administrator to activate your hotel account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite-token">Invite Token</Label>
          <Input
            id="invite-token"
            type="text"
            placeholder="Enter your invite token"
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            disabled={consumeMutation.isPending}
            className="font-mono"
          />
          <p className="text-sm text-muted-foreground">
            The token is your principal ID provided by the administrator
          </p>
        </div>

        {validationResult !== null && (
          <Alert className={validationResult ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
            {validationResult ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Token is valid and ready to use
                </AlertDescription>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Invalid or expired token. Please verify the token and try again.
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleValidate}
            variant="outline"
            disabled={validateMutation.isPending || !token.trim()}
            className="flex-1"
          >
            {validateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate Token'
            )}
          </Button>
          <Button
            onClick={handleActivate}
            disabled={isActivateDisabled}
            className="flex-1"
          >
            {consumeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Activate Hotel Account
              </>
            )}
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Note:</strong> After activation, you'll be able to manage your hotel profile, add rooms, and handle bookings.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
