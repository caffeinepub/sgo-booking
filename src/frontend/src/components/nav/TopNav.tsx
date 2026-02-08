import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserRole, useIsCurrentUserAdmin, useGetCallerHotelProfile } from '../../hooks/useQueries';
import { LanguageSelector } from './LanguageSelector';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, ShieldCheck, User, LogOut, LogIn, Home, Calendar } from 'lucide-react';
import { UserRole } from '../../backend';

export function TopNav() {
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const { data: role } = useGetCallerUserRole();
  const { data: isAdmin } = useIsCurrentUserAdmin();
  
  // Only fetch hotel profile when authenticated
  const { data: hotelProfile } = useGetCallerHotelProfile({ 
    enabled: isAuthenticated 
  });

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  // Show Admin Panel link if user is admin
  const showAdminPanel = isAdmin === true;
  
  // Show Hotel Area link if user is admin OR if user has hotel role and is activated
  const showHotelArea = isAdmin === true || (role === UserRole.user && !!hotelProfile);

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
              <Building2 className="h-6 w-6" />
              SGO-Booking
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>

              <Button variant="ghost" asChild>
                <Link to="/browse">Browse Hotels</Link>
              </Button>

              {isAuthenticated && (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/bookings">
                      <Calendar className="h-4 w-4 mr-2" />
                      My Bookings
                    </Link>
                  </Button>

                  <Button variant="ghost" asChild>
                    <Link to="/account">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Link>
                  </Button>
                </>
              )}

              {showAdminPanel && (
                <Button variant="ghost" asChild>
                  <Link to="/admin">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Link>
                </Button>
              )}

              {showHotelArea && (
                <Button variant="ghost" asChild>
                  <Link to="/hotel">
                    <Building2 className="h-4 w-4 mr-2" />
                    Hotel Area
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />

            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button onClick={handleLogin} disabled={isLoggingIn} size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
