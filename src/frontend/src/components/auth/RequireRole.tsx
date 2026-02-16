import React from 'react';
import { useGetCallerUserRole, useIsCurrentUserAdmin, useIsCallerHotelActivated } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Loader2 } from 'lucide-react';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { GuardErrorScreen } from './GuardErrorScreen';
import type { UserRole } from '../../backend';

interface RequireRoleProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  requireHotelActivation?: boolean;
}

export function RequireRole({ children, requiredRoles, requireHotelActivation = false }: RequireRoleProps) {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading: roleLoading, error: roleError, isFetched: roleFetched } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsCurrentUserAdmin();
  const { data: isHotelActivated, isLoading: hotelActivationLoading, isFetched: hotelActivationFetched } = useIsCallerHotelActivated();

  // Wait for identity and queries to complete
  if (!identity || roleLoading || adminLoading || (requireHotelActivation && hotelActivationLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Handle role check errors
  if (roleError && roleFetched) {
    return <GuardErrorScreen error={roleError} />;
  }

  // Admin bypass - admins can access everything
  if (isAdmin && adminFetched) {
    return <>{children}</>;
  }

  // Check if user has required role
  const hasRequiredRole = userRole && requiredRoles.includes(userRole);

  if (!hasRequiredRole && roleFetched) {
    return (
      <AccessDeniedScreen
        currentRole={userRole}
        requiredRoles={requiredRoles}
        isHotelActivated={false}
      />
    );
  }

  // Check hotel activation if required (V44: use role-based activation check)
  if (requireHotelActivation && hotelActivationFetched) {
    if (!isHotelActivated) {
      return (
        <AccessDeniedScreen
          currentRole={userRole}
          requiredRoles={requiredRoles}
          isHotelActivated={false}
        />
      );
    }
  }

  return <>{children}</>;
}
