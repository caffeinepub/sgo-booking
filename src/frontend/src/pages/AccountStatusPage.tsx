import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { User, Shield, Building2, RefreshCw, Copy, CheckCircle2, Key } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole, useIsCurrentUserAdmin, useMakeMeAdmin, useGetCallerHotelProfile } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { HotelActivationForm } from '../components/auth/HotelActivationForm';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function AccountStatusPage() {
  const { identity } = useInternetIdentity();
  const { data: role, isLoading: roleLoading, refetch: refetchRole } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading, refetch: refetchAdmin } = useIsCurrentUserAdmin();
  const { data: hotelProfile, isLoading: hotelProfileLoading, refetch: refetchHotelProfile } = useGetCallerHotelProfile();
  const makeMeAdmin = useMakeMeAdmin();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const principalId = identity?.getPrincipal().toString() || 'Not logged in';
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isHotelActivated = !!hotelProfile;

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(principalId);
    setCopied(true);
    toast.success('Principal ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMakeMeAdmin = async () => {
    try {
      await makeMeAdmin.mutateAsync();
      toast.success('Admin privileges granted');
      await Promise.all([
        refetchRole(),
        refetchAdmin(),
      ]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to grant admin privileges');
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchRole(),
        refetchAdmin(),
        refetchHotelProfile(),
        queryClient.refetchQueries({ queryKey: ['callerHotelProfile'] }),
        queryClient.refetchQueries({ queryKey: ['hotels'] }),
        queryClient.refetchQueries({ queryKey: ['adminHotels'] }),
      ]);
      toast.success('Account status refreshed');
    } catch (error: any) {
      toast.error('Failed to refresh account status');
    }
  };

  const getRoleBadgeVariant = (role?: UserRole): 'default' | 'secondary' | 'outline' => {
    if (role === UserRole.admin) return 'default';
    if (role === UserRole.user) return 'secondary';
    return 'outline';
  };

  const getRoleIcon = (role?: UserRole) => {
    if (role === UserRole.admin) return <Shield className="h-4 w-4" />;
    if (role === UserRole.user) return <User className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Account Status</h1>
          <p className="text-muted-foreground mt-2">
            View your account information and manage your roles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={roleLoading || adminLoading || hotelProfileLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              Your Internet Identity and role information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Principal ID</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPrincipal}
                  disabled={!isAuthenticated}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <code className="block p-3 bg-muted rounded-md text-xs break-all">
                {principalId}
              </code>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-sm font-medium">Current Role</span>
              <div className="flex items-center gap-2">
                {roleLoading ? (
                  <Badge variant="outline">Loading...</Badge>
                ) : (
                  <Badge variant={getRoleBadgeVariant(role)} className="gap-1">
                    {getRoleIcon(role)}
                    {role || 'Unknown'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Admin Status</span>
              <div className="flex items-center gap-2">
                {adminLoading ? (
                  <Badge variant="outline">Checking...</Badge>
                ) : isAdmin ? (
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Admin</Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Hotel Activation Status</span>
              <div className="flex items-center gap-2">
                {hotelProfileLoading ? (
                  <Badge variant="outline">Checking...</Badge>
                ) : isHotelActivated ? (
                  <Badge variant="default" className="gap-1">
                    <Building2 className="h-4 w-4" />
                    Activated
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Activated</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isAuthenticated && !isHotelActivated && !isAdmin && (
          <>
            <Separator />
            <HotelActivationForm />
          </>
        )}

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Developer Tools
            </CardTitle>
            <CardDescription>
              Tools for testing and development (hardcoded admin only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                These tools are only available to the hardcoded admin principal. If you are the hardcoded admin, you can use these tools to grant yourself admin privileges.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleMakeMeAdmin}
              disabled={makeMeAdmin.isPending || !isAuthenticated}
              variant="outline"
              className="w-full"
            >
              {makeMeAdmin.isPending ? 'Granting...' : 'Make Me Admin (Hardcoded Admin Only)'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
