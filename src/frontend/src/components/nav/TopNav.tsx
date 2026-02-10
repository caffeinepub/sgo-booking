import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { Building2, Home, Search, Calendar, User, Shield } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCurrentUserAdmin, useGetCallerHotelProfile } from '../../hooks/useQueries';

export function TopNav() {
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCurrentUserAdmin();
  const { data: hotelProfile } = useGetCallerHotelProfile();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';
  const isHotelActivated = !!hotelProfile;

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
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const showHotelArea = isAuthenticated && (isAdmin || isHotelActivated);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Building2 className="h-6 w-6" />
              <span>SGO-Booking</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/browse" className="gap-2">
                  <Search className="h-4 w-4" />
                  Browse Hotels
                </Link>
              </Button>
              {isAuthenticated && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/bookings" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      My Bookings
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/account-status" className="gap-2">
                      <User className="h-4 w-4" />
                      Account
                    </Link>
                  </Button>
                </>
              )}
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              )}
              {showHotelArea && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/hotel" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Hotel Area
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
          >
            {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </div>
      </div>
    </nav>
  );
}
