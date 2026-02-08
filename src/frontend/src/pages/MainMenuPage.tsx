import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { User, Building2, Search, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserRole, useGetCallerHotelProfile, useIsCurrentUserAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { UserRole } from '../backend';

export function MainMenuPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: isAdmin, isLoading: adminLoading } = useIsCurrentUserAdmin();
  const { data: hotelProfile, isLoading: hotelProfileLoading } = useGetCallerHotelProfile();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isHotelActivated = !!hotelProfile;

  const getHotelStatusText = () => {
    if (isAdmin) return 'Admin Access';
    if (isHotelActivated) return 'Activated';
    return 'Requires Activation';
  };

  const getHotelStatusVariant = (): 'default' | 'secondary' | 'outline' => {
    if (isAdmin) return 'default';
    if (isHotelActivated) return 'default';
    return 'secondary';
  };

  const handleGuestPortalClick = () => {
    navigate({ to: '/browse' });
  };

  const handleHotelPortalClick = () => {
    if (!isAuthenticated) {
      navigate({ to: '/account-status' });
      return;
    }

    if (isHotelActivated || isAdmin) {
      navigate({ to: '/hotel' });
    } else {
      navigate({ to: '/account-status' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Welcome to SGO-Booking</h1>
          <p className="text-lg text-muted-foreground">
            Choose your portal to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Portal Card */}
          <Card className="hover:shadow-xl transition-shadow border-2">
            <CardHeader className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-t-lg pb-16">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <User className="h-12 w-12" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Guest Portal</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <CardDescription className="text-base text-center">
                Find luxury accommodations with privacy. Easy booking without sensitive personal data.
              </CardDescription>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Browse available hotels</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Make bookings instantly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Manage your reservations</span>
                </div>
              </div>

              <Button
                onClick={handleGuestPortalClick}
                className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                size="lg"
              >
                <Search className="h-5 w-5" />
                Browse & Book Hotels
              </Button>
            </CardContent>
          </Card>

          {/* Hotel Portal Card */}
          <Card className="hover:shadow-xl transition-shadow border-2">
            <CardHeader className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-t-lg pb-16">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Building2 className="h-12 w-12" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Hotel Portal</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <CardDescription className="text-base text-center">
                Manage your property, accept bookings, and build your hotel's reputation.
              </CardDescription>

              <div className="flex items-center justify-center py-2">
                <Badge variant={getHotelStatusVariant()} className="text-sm px-4 py-1">
                  Status: {roleLoading || adminLoading || hotelProfileLoading ? 'Checking...' : getHotelStatusText()}
                </Badge>
              </div>

              {!isAuthenticated ? (
                <Alert className="bg-amber-50 border-amber-200">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Login required to access Hotel Portal
                  </AlertDescription>
                </Alert>
              ) : !isHotelActivated && !isAdmin ? (
                <Alert className="bg-amber-50 border-amber-200">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Contact admin for activation token to enable hotel management
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button
                onClick={handleHotelPortalClick}
                className="w-full gap-2 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black"
                size="lg"
              >
                {!isAuthenticated ? (
                  <>
                    <Lock className="h-5 w-5" />
                    Login to Continue
                  </>
                ) : isHotelActivated || isAdmin ? (
                  <>
                    <Building2 className="h-5 w-5" />
                    Hotel Management Area
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Activate Hotel Account
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Visit{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => navigate({ to: '/account-status' })}
            >
              Account Status
            </Button>
            {' '}for more information
          </p>
        </div>
      </div>
    </div>
  );
}
