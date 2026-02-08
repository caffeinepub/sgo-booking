import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield } from 'lucide-react';
import { InviteTokensPanel } from '../components/admin/InviteTokensPanel';
import { HotelVisibilityPanel } from '../components/admin/HotelVisibilityPanel';
import { AdminBookingsPanel } from '../components/admin/AdminBookingsPanel';

export function AdminPanelPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">
          Manage hotel invites, visibility, payments, and bookings
        </p>
      </div>

      <div className="space-y-6">
        <InviteTokensPanel />
        <HotelVisibilityPanel />
        <AdminBookingsPanel />
      </div>
    </div>
  );
}
