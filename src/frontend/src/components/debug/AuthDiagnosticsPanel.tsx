import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserRole, useIsCurrentUserAdmin, useGetCallerHotelProfile } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function AuthDiagnosticsPanel() {
  const { identity } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading } = useIsCurrentUserAdmin();
  const { data: hotelProfile, isLoading: hotelLoading } = useGetCallerHotelProfile();

  const principalId = identity?.getPrincipal().toString() || 'Not authenticated';

  const getRoleDisplay = (role?: UserRole) => {
    if (!role) return 'Unknown';
    if (role === UserRole.admin) return 'Admin';
    if (role === UserRole.user) return 'Hotel';
    return 'Guest';
  };

  const StatusIcon = ({ status }: { status: boolean | null | undefined }) => {
    if (status === true) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Authentication Diagnostics (V24)</CardTitle>
        <CardDescription>Real-time auth state for debugging role/access issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Authenticated:</span>
            <div className="flex items-center gap-2">
              <StatusIcon status={!!identity} />
              <Badge variant={identity ? 'default' : 'secondary'}>
                {identity ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Principal ID:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate">
              {principalId}
            </code>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Role:</span>
            <div className="flex items-center gap-2">
              {roleLoading ? (
                <span className="text-xs text-muted-foreground">Loading...</span>
              ) : (
                <>
                  <StatusIcon status={!!role} />
                  <Badge variant={role === UserRole.admin ? 'default' : 'secondary'}>
                    {getRoleDisplay(role)}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Is Admin:</span>
            <div className="flex items-center gap-2">
              {adminLoading ? (
                <span className="text-xs text-muted-foreground">Loading...</span>
              ) : (
                <>
                  <StatusIcon status={isAdmin} />
                  <Badge variant={isAdmin ? 'default' : 'secondary'}>
                    {isAdmin ? 'Yes' : 'No'}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hotel Activated:</span>
            <div className="flex items-center gap-2">
              {hotelLoading ? (
                <span className="text-xs text-muted-foreground">Loading...</span>
              ) : (
                <>
                  <StatusIcon status={!!hotelProfile} />
                  <Badge variant={hotelProfile ? 'default' : 'secondary'}>
                    {hotelProfile ? 'Yes' : 'No'}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Expected behavior (V24):</strong>
            <br />
            • Admin accounts: isAdmin=true, can access /admin and /hotel
            <br />
            • Hotel accounts: role=Hotel, hotelActivated=true, can access /hotel
            <br />
            • Guest accounts: role=Guest, cannot access /admin or /hotel
            <br />
            • Query keys are scoped to principal to prevent cross-session cache pollution
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
