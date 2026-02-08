import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserRole, useIsCurrentUserAdmin, useGetCallerHotelProfile } from '../../hooks/useQueries';
import { LanguageSelector } from './LanguageSelector';
import { LogIn, LogOut, Building2, Shield, Home } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from '../../backend';

export function TopNav() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading } = useIsCurrentUserAdmin();
  
  // Only fetch hotel profile when authenticated (for navigation visibility)
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: hotelProfile, isLoading: hotelProfileLoading } = useGetCallerHotelProfile({ 
    enabled: isAuthenticated 
  });
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Check if user has an activated hotel profile (null means not activated or rejected)
  const isHotelActivated = !!hotelProfile;
  
  // Show Hotel Area if: admin (regardless of hotel profile) OR (user role AND has activated hotel profile)
  // For admins, don't wait on hotel profile loading
  const showHotelArea = isAuthenticated && !roleLoading && !adminLoading && 
    (isAdmin === true || (!hotelProfileLoading && role === UserRole.user && isHotelActivated));
  
  // Show Admin Panel if: admin (only when we have definitive data)
  const showAdminPanel = isAuthenticated && !adminLoading && isAdmin === true;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
              <Home className="h-6 w-6 text-primary" />
              <span>SGO-Booking</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" asChild>
                <Link to="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/browse">Browse Hotels</Link>
              </Button>
              {isAuthenticated && (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/guest">My Bookings</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/account-status">Account</Link>
                  </Button>
                </>
              )}
              {showHotelArea && (
                <Button variant="ghost" asChild className="gap-2">
                  <Link to="/hotel">
                    <Building2 className="h-4 w-4" />
                    Hotel Area
                  </Link>
                </Button>
              )}
              {showAdminPanel && (
                <Button variant="ghost" asChild className="gap-2">
                  <Link to="/admin">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              className="gap-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
