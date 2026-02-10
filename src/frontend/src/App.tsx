import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { LocaleProvider } from './i18n/LocaleContext';
import { AppShell } from './components/layout/AppShell';
import { MainMenuPage } from './pages/MainMenuPage';
import { BrowseHotelsPage } from './pages/BrowseHotelsPage';
import { GuestAccountPage } from './pages/GuestAccountPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AccountStatusPage } from './pages/AccountStatusPage';
import { HotelAreaPage } from './pages/HotelAreaPage';
import AdminPanelPage from './pages/AdminPanelPage';
import { HotelDetailPage } from './pages/HotelDetailPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireRole } from './components/auth/RequireRole';
import { ProfileCompletionGate } from './components/auth/ProfileCompletionGate';
import { Toaster } from './components/ui/sonner';
import { UserRole } from './backend';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainMenuPage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowseHotelsPage,
});

const hotelDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse/$hotelId',
  component: HotelDetailPage,
});

const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookings',
  component: () => (
    <RequireAuth>
      <ProfileCompletionGate>
        <MyBookingsPage />
      </ProfileCompletionGate>
    </RequireAuth>
  ),
});

const guestAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guest',
  component: () => (
    <RequireAuth>
      <ProfileCompletionGate>
        <GuestAccountPage />
      </ProfileCompletionGate>
    </RequireAuth>
  ),
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: () => (
    <RequireAuth>
      <ProfileCompletionGate>
        <GuestAccountPage />
      </ProfileCompletionGate>
    </RequireAuth>
  ),
});

const accountStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account-status',
  component: AccountStatusPage,
});

const hotelAreaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel',
  component: () => (
    <RequireAuth>
      <ProfileCompletionGate>
        <RequireRole allowedRoles={[UserRole.user, UserRole.admin]} requireHotelActivation={true}>
          <HotelAreaPage />
        </RequireRole>
      </ProfileCompletionGate>
    </RequireAuth>
  ),
});

const adminPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RequireAuth>
      <ProfileCompletionGate>
        <RequireRole allowedRoles={[UserRole.admin]}>
          <AdminPanelPage />
        </RequireRole>
      </ProfileCompletionGate>
    </RequireAuth>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  hotelDetailRoute,
  bookingsRoute,
  guestAccountRoute,
  accountRoute,
  accountStatusRoute,
  hotelAreaRoute,
  adminPanelRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <RouterProvider router={router} />
        <Toaster />
      </LocaleProvider>
    </QueryClientProvider>
  );
}

export default App;
