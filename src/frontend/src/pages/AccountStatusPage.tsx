import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole, useValidateInviteToken, useConsumeInviteToken, useMakeMeAdmin, useIsCurrentUserAdmin, useGetCallerHotelProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { User, Shield, Code, RefreshCw, Copy, Key, AlertCircle, CheckCircle2, Wrench } from 'lucide-react';
import { BUILD_VERSION } from '../buildInfo';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from '../backend';
import { useNavigate } from '@tanstack/react-router';
import { AuthDiagnosticsPanel } from '../components/debug/AuthDiagnosticsPanel';

export function AccountStatusPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: role, isLoading: roleLoading, refetch: refetchRole } = useGetCallerUserRole();
  const { data: isAdmin, refetch: refetchAdmin } = useIsCurrentUserAdmin();
  const { data: hotelProfile, refetch: refetchHotelProfile } = useGetCallerHotelProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const validateToken = useValidateInviteToken();
  const consumeToken = useConsumeInviteToken();
  const makeMeAdmin = useMakeMeAdmin();

  const [inviteToken, setInviteToken] = useState('');
  const [tokenValidation, setTokenValidation] = useState<{ valid: boolean; message: string } | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principalId = isAuthenticated ? identity?.getPrincipal().toString() : null;
  const isGuest = role === UserRole.guest;
  const isUser = role === UserRole.user;
  const isHotelActivated = !!hotelProfile;

  const handleRefresh = async () => {
    await Promise.all([
      refetchRole(),
      refetchAdmin(),
      refetchHotelProfile(),
      queryClient.invalidateQueries({ queryKey: ['hotels'] }),
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] }),
    ]);
    toast.success('Account status refreshed');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleValidateToken = async () => {
    if (!inviteToken.trim()) {
      setTokenValidation({ valid: false, message: 'Please enter an invite token' });
      return;
    }

    try {
      const isValid = await validateToken.mutateAsync(inviteToken.trim());
      setTokenValidation({
        valid: isValid,
        message: isValid ? 'Token is valid and ready to use' : 'Token is invalid or expired',
      });
    } catch (error: any) {
      setTokenValidation({ valid: false, message: 'Failed to validate token' });
    }
  };

  const handleConsumeToken = async () => {
    if (!inviteToken.trim()) {
      toast.error('Please enter an invite token');
      return;
    }

    try {
      await consumeToken.mutateAsync(inviteToken.trim());
      toast.success('Hotel access granted! Redirecting to Hotel Area...');
      setInviteToken('');
      setTokenValidation(null);
      await handleRefresh();
      setTimeout(() => navigate({ to: '/hotel' }), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to consume invite token');
    }
  };

  const handleMakeMeAdmin = async () => {
    try {
      await makeMeAdmin.mutateAsync();
      toast.success('Admin access granted!');
      await handleRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to grant admin access');
    }
  };

  const getRoleDisplay = () => {
    if (!role) return 'Guest';
    if (role === UserRole.admin) return 'Admin';
    if (role === UserRole.user) return 'Hotel';
    return 'Guest';
  };

  const getRoleVariant = (): 'default' | 'secondary' | 'outline' => {
    if (role === UserRole.admin) return 'default';
    if (role === UserRole.user) return 'secondary';
    return 'outline';
  };

  const getRoleDescription = () => {
    if (isAdmin) return 'You have full administrative access to the system';
    if (isUser) return 'You can manage your hotel, rooms, and bookings';
    return 'You can browse hotels and make bookings';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Status</h1>
          <p className="text-muted-foreground">View your account details and troubleshooting tools</p>
        </div>

        <div className="space-y-6">
          <AuthDiagnosticsPanel />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Account Status</CardTitle>
                </div>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={roleLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${roleLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <CardDescription>Your Internet Identity authentication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Build Version</Label>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">{BUILD_VERSION}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(BUILD_VERSION, 'Build version')}
                    className="gap-1"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isAuthenticated && principalId && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Principal ID</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                        {principalId}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(principalId, 'Principal ID')}
                        className="gap-1"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Role</Label>
                    </div>
                    <div className="space-y-2">
                      <Badge variant={getRoleVariant()} className="text-sm">
                        {roleLoading ? 'Loading...' : getRoleDisplay()}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{getRoleDescription()}</p>
                    </div>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not Authenticated</AlertTitle>
                  <AlertDescription>
                    Please log in with Internet Identity to view your account details and access hotel features.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {isAuthenticated && isUser && !isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Hotel Onboarding</CardTitle>
                <CardDescription>Activate your hotel account to access management features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isHotelActivated ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Hotel Access Active</AlertTitle>
                    <AlertDescription>
                      Your hotel account is activated and ready to use. You can access the Hotel Area to manage your
                      property.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Activation Required</AlertTitle>
                      <AlertDescription>
                        To activate your hotel account, you need an invite token from an administrator. Contact the
                        admin and provide your Principal ID above to receive your activation token.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="inviteToken">Invite Token</Label>
                        <Input
                          id="inviteToken"
                          type="text"
                          value={inviteToken}
                          onChange={(e) => {
                            setInviteToken(e.target.value);
                            setTokenValidation(null);
                          }}
                          placeholder="Enter your invite token"
                        />
                      </div>

                      {tokenValidation && (
                        <Alert variant={tokenValidation.valid ? 'default' : 'destructive'}>
                          {tokenValidation.valid ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <AlertDescription>{tokenValidation.message}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleValidateToken}
                          variant="outline"
                          disabled={validateToken.isPending || !inviteToken.trim()}
                          className="flex-1"
                        >
                          {validateToken.isPending ? 'Validating...' : 'Validate Token'}
                        </Button>
                        <Button
                          onClick={handleConsumeToken}
                          disabled={consumeToken.isPending || !inviteToken.trim()}
                          className="flex-1"
                        >
                          {consumeToken.isPending ? 'Activating...' : 'Activate Hotel Account'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {isAuthenticated && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Developer Tools</CardTitle>
                </div>
                <CardDescription>Advanced tools for testing and development</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleMakeMeAdmin} disabled={makeMeAdmin.isPending} variant="outline" className="w-full">
                  {makeMeAdmin.isPending ? 'Granting Admin Access...' : 'Make Me Admin'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will grant you full administrative access to the system
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
