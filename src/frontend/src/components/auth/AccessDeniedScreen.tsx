import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ShieldAlert, ArrowRight, Info } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { UserRole } from '../../backend';
import { HotelActivationForm } from './HotelActivationForm';

interface AccessDeniedScreenProps {
  currentRole?: UserRole;
  requiredRoles?: UserRole[];
  isHotelActivated?: boolean;
}

export function AccessDeniedScreen({ currentRole, requiredRoles, isHotelActivated }: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  const getRoleDisplay = (role: UserRole) => {
    if (role === UserRole.admin) return 'Admin';
    if (role === UserRole.user) return 'Hotel';
    return 'Guest';
  };

  const getRequiredRolesText = () => {
    if (!requiredRoles || requiredRoles.length === 0) return 'special access';
    if (requiredRoles.length === 1) return getRoleDisplay(requiredRoles[0]);
    return requiredRoles.map(getRoleDisplay).join(' or ');
  };

  const isAdminOnlyPage = requiredRoles?.length === 1 && requiredRoles[0] === UserRole.admin;
  const isHotelRequired = requiredRoles?.includes(UserRole.user);
  const needsActivation = isHotelRequired && !isHotelActivated && currentRole === UserRole.user;

  const handleActivationSuccess = () => {
    setTimeout(() => {
      navigate({ to: '/hotel' });
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              {needsActivation
                ? 'Hotel activation required to access this area'
                : "You don't have permission to access this page"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Required Access Level</AlertTitle>
              <AlertDescription>
                This page requires <strong>{getRequiredRolesText()}</strong> access.
                {currentRole && (
                  <>
                    {' '}
                    Your current role is <strong>{getRoleDisplay(currentRole)}</strong>.
                  </>
                )}
              </AlertDescription>
            </Alert>

            {isAdminOnlyPage && (
              <Alert variant="destructive">
                <AlertTitle>Admin Access Only</AlertTitle>
                <AlertDescription>
                  This area is restricted to system administrators. If you believe you should have access, please
                  contact support.
                </AlertDescription>
              </Alert>
            )}

            {!needsActivation && (
              <div className="space-y-2">
                <Button onClick={() => navigate({ to: '/browse' })} variant="outline" className="w-full gap-2">
                  Browse Hotels
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {needsActivation && (
          <>
            <HotelActivationForm onSuccess={handleActivationSuccess} />
            <div className="flex justify-center">
              <Button onClick={() => navigate({ to: '/' })} variant="ghost">
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
