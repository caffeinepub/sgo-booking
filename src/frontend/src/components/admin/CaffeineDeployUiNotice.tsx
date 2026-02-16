import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Admin-facing informational notice about the Caffeine deploy UI sometimes
 * not showing the Publish URL / Open App link after successful deploys.
 * Includes cache-busting instructions and a reload button.
 */
export function CaffeineDeployUiNotice() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-sm text-amber-800 dark:text-amber-200 space-y-3">
        <div>
          <strong>Deploy & Publish URL Guidance:</strong>
        </div>
        <div>
          If the Caffeine platform doesn't show the "Open App" link or Publish URL after deployment:
        </div>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Try refreshing the Caffeine platform page</li>
          <li>Switch between Draft and Live tabs in the platform UI</li>
          <li>Check the deployment history section for the published link</li>
        </ul>
        <div>
          <strong>Cache-Busting:</strong> If you see old content after deployment, perform a hard refresh:
        </div>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Windows/Linux:</strong> Press Ctrl + Shift + R or Ctrl + F5</li>
          <li><strong>Mac:</strong> Press Cmd + Shift + R or Cmd + Option + R</li>
        </ul>
        <div className="pt-2">
          <Button
            onClick={handleReload}
            variant="outline"
            size="sm"
            className="bg-white dark:bg-amber-900 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload App
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
