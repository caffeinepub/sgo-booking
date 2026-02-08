import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserRole, useIsCurrentUserAdmin, useGetHotels } from '../../hooks/useQueries';
import { Info, CheckCircle2, XCircle } from 'lucide-react';
import { isDebugEnabled } from '../../utils/debugFlags';

export function AuthDiagnosticsPanel() {
  const { identity } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading } = useIsCurrentUserAdmin();
  const { data: hotels, isLoading: hotelsLoading } = useGetHotels();

  if (!isDebugEnabled()) {
    return null;
  }

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principalId = identity?.getPrincipal().toString();
  const myHotel = hotels?.find((h) => h.id.toString() === principalId);
  const isHotelActivated = !!myHotel;

  return (
    <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-900 dark:text-amber-100">Auth Diagnostics (Debug Mode)</CardTitle>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          Real-time authentication and authorization state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Authenticated</p>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <Badge variant="default">Yes</Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <Badge variant="outline">No</Badge>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Role</p>
            {roleLoading ? (
              <Badge variant="outline">Loading...</Badge>
            ) : (
              <Badge variant="secondary">{role || 'None'}</Badge>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Is Admin</p>
            {adminLoading ? (
              <Badge variant="outline">Loading...</Badge>
            ) : (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <Badge variant="default">Yes</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline">No</Badge>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Hotel Activated</p>
            {hotelsLoading ? (
              <Badge variant="outline">Loading...</Badge>
            ) : (
              <div className="flex items-center gap-2">
                {isHotelActivated ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <Badge variant="default">Yes</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline">No</Badge>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {principalId && (
          <Alert className="bg-white dark:bg-gray-900">
            <AlertDescription className="text-xs font-mono break-all">{principalId}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
          <p>• Hotel Area visible: {isAdmin || (role === 'user' && isHotelActivated) ? 'Yes' : 'No'}</p>
          <p>• Admin Panel visible: {isAdmin ? 'Yes' : 'No'}</p>
          <p>• Total hotels in system: {hotels?.length || 0}</p>
        </div>
      </CardContent>
    </Card>
  );
}
