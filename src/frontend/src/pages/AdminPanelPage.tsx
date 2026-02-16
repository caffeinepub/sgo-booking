import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Shield } from 'lucide-react';
import { InviteTokensPanel } from '../components/admin/InviteTokensPanel';
import { HotelVisibilityPanel } from '../components/admin/HotelVisibilityPanel';
import { AdminBookingsPanel } from '../components/admin/AdminBookingsPanel';
import { PrincipalPurgePanel } from '../components/admin/PrincipalPurgePanel';
import { DataCleanupPanel } from '../components/admin/DataCleanupPanel';
import { CaffeineDeployUiNotice } from '../components/admin/CaffeineDeployUiNotice';
import { DeploymentPublishInfoPanel } from '../components/admin/DeploymentPublishInfoPanel';

export function AdminPanelPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
          <Shield className="h-9 w-9 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage hotels, bookings, invite tokens, and system settings
        </p>
      </div>

      <CaffeineDeployUiNotice />

      <Separator className="my-8" />

      <DeploymentPublishInfoPanel />

      <Separator className="my-8" />

      <InviteTokensPanel />

      <Separator className="my-8" />

      <HotelVisibilityPanel />

      <Separator className="my-8" />

      <AdminBookingsPanel />

      <Separator className="my-8" />

      <PrincipalPurgePanel />

      <Separator className="my-8" />

      <DataCleanupPanel />
    </div>
  );
}
