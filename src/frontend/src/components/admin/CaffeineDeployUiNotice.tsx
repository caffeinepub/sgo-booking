import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

/**
 * Admin-facing informational notice about the Caffeine deploy UI sometimes
 * not showing the Publish URL / Open App link after successful deploys.
 * This is a non-blocking informational component.
 */
export function CaffeineDeployUiNotice() {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
        <strong>Deploy UI Note:</strong> If the Caffeine platform doesn't show the "Open App" link or Publish URL after deployment, 
        try refreshing the page or switching between Draft/Live tabs. This is a known platform UI issue and doesn't affect the app's functionality.
      </AlertDescription>
    </Alert>
  );
}
