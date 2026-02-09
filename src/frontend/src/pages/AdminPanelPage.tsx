import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { InviteTokensPanel } from '../components/admin/InviteTokensPanel';
import { HotelVisibilityPanel } from '../components/admin/HotelVisibilityPanel';
import { AdminBookingsPanel } from '../components/admin/AdminBookingsPanel';
import { DataCleanupPanel } from '../components/admin/DataCleanupPanel';
import { CaffeineDeployUiNotice } from '../components/admin/CaffeineDeployUiNotice';
import { Separator } from '../components/ui/separator';
import { Shield } from 'lucide-react';

export default function AdminPanelPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage hotels, invites, bookings, and system data</p>
        </div>
      </div>

      <CaffeineDeployUiNotice />

      <InviteTokensPanel />
      
      <Separator />
      
      <HotelVisibilityPanel />
      
      <Separator />
      
      <AdminBookingsPanel />
      
      <Separator />
      
      <DataCleanupPanel />
    </div>
  );
}
