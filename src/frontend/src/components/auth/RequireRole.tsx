import React from 'react';
import { useGetCallerUserRole, useIsCurrentUserAdmin, useIsCallerHotelActivated } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { GuardErrorScreen } from './GuardErrorScreen';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requireHotelActivation?: boolean;
}

export function RequireRole({ children, allowedRoles, requireHotelActivation = false }: RequireRoleProps) {
  const { data: currentRole, isLoading: roleLoading, isError: roleError, error: roleErrorObj, isFetched: roleFetched } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading, isError: adminError, error: adminErrorObj, isFetched: adminFetched } = useIsCurrentUserAdmin();
  const { data: isHotelActivated, isLoading: activationLoading, isError: activationError, error: activationErrorObj, isFetched: activationFetched } = useIsCallerHotelActivated();

  // Wait for all queries to be fetched before making access decisions
  const allFetched = roleFetched && adminFetched && activationFetched;
  const anyLoading = roleLoading || adminLoading || activationLoading;
  const anyError = roleError || adminError || activationError;

  // Show loading state while queries are in progress
  if (anyLoading || !allFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show error screen if permission check failed
  if (anyError) {
    const error = roleErrorObj || adminErrorObj || activationErrorObj || new Error('Permission check failed');
    return <GuardErrorScreen error={error} />;
  }

  // Admin bypass: admins can access everything
  if (isAdmin === true) {
    return <>{children}</>;
  }

  // Check if user's role is in the allowed list
  const hasRequiredRole = currentRole && allowedRoles.includes(currentRole);

  // If hotel activation is required, check activation status
  if (requireHotelActivation && hasRequiredRole) {
    if (isHotelActivated !== true) {
      return (
        <AccessDeniedScreen
          currentRole={currentRole}
          requiredRoles={allowedRoles}
          isHotelActivated={false}
        />
      );
    }
  }

  // Grant access if role matches
  if (hasRequiredRole) {
    return <>{children}</>;
  }

  // Deny access
  return (
    <AccessDeniedScreen
      currentRole={currentRole}
      requiredRoles={allowedRoles}
      isHotelActivated={isHotelActivated}
    />
  );
}
