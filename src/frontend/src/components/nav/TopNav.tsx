import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCurrentUserAdmin, useIsCallerHotelActivated } from '../../hooks/useQueries';
import { LanguageSelector } from './LanguageSelector';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, ShieldCheck, User, LogOut, LogIn, Home, Calendar } from 'lucide-react';

export function TopNav() {
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsCurrentUserAdmin();
  const { data: isHotelActivated } = useIsCallerHotelActivated();

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
  
  // Show Hotel Area link if user is admin OR if user is an activated hotel
  const showHotelArea = isAdmin === true || isHotelActivated === true;

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors">
              <Home className="h-5 w-5" />
              <span>SGO-Booking</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" asChild>
                <Link to="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/browse">Browse Hotels</Link>
              </Button>
              {isAuthenticated && (
                <Button variant="ghost" asChild>
                  <Link to="/bookings" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    My Bookings
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector />

            {isAuthenticated && (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/account" className="gap-2">
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                </Button>

                {showAdminPanel && (
                  <Button variant="outline" asChild>
                    <Link to="/admin" className="gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </Button>
                )}

                {showHotelArea && (
                  <Button variant="outline" asChild>
                    <Link to="/hotel" className="gap-2">
                      <Building2 className="h-4 w-4" />
                      Hotel Area
                    </Link>
                  </Button>
                )}

                <Button onClick={handleLogout} variant="ghost" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <Button onClick={handleLogin} disabled={isLoggingIn} className="gap-2">
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
