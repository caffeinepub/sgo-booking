import React from 'react';
import { useGetCallerUserRole, useGetCallerHotelProfile, useIsCurrentUserAdmin } from '../../hooks/useQueries';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { GuardErrorScreen } from './GuardErrorScreen';
import { UserRole } from '../../backend';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RequireRole({ children, allowedRoles }: RequireRoleProps) {
  const { data: role, isLoading: roleLoading, error: roleError, isFetched: roleFetched } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading, error: adminError, isFetched: adminFetched } = useIsCurrentUserAdmin();
  
  // Only fetch hotel profile if role is UserRole.user (not just if it's in allowedRoles)
  const shouldCheckHotelProfile = role === UserRole.user;
  const { data: hotelProfile, isLoading: hotelProfileLoading, isFetched: hotelProfileFetched } = useGetCallerHotelProfile({ 
    enabled: shouldCheckHotelProfile 
  });

  // If role or admin queries failed, show error screen instead of infinite spinner
  if (roleError || adminError) {
    return <GuardErrorScreen error={roleError || adminError} />;
  }

  // Admin bypass - check first before any loading states, but only after queries are fetched
  if (adminFetched && isAdmin === true) {
    return <>{children}</>;
  }

  // Determine which queries we're actually waiting for
  const relevantLoading = roleLoading || adminLoading || (shouldCheckHotelProfile && hotelProfileLoading);
  const relevantFetched = roleFetched && adminFetched && (!shouldCheckHotelProfile || hotelProfileFetched);

  // Show loading state while checking permissions
  if (relevantLoading || !relevantFetched) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  const hasAccess = role && allowedRoles.includes(role);
  
  // For hotel users accessing hotel routes, also check activation
  const needsHotelCheck = allowedRoles.includes(UserRole.user);
  const isHotelActivated = !!hotelProfile;
  const needsActivation = needsHotelCheck && role === UserRole.user && !isHotelActivated;

  if (!hasAccess || needsActivation) {
    return (
      <AccessDeniedScreen
        currentRole={role}
        requiredRoles={allowedRoles}
        isHotelActivated={isHotelActivated}
      />
    );
  }

  return <>{children}</>;
}
