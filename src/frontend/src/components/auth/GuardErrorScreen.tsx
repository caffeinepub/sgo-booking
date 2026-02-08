import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface GuardErrorScreenProps {
  error: unknown;
}

export function GuardErrorScreen({ error }: GuardErrorScreenProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
    queryClient.invalidateQueries({ queryKey: ['isCurrentUserAdmin'] });
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate({ to: '/' });
  };

  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <CardTitle>Permission Check Failed</CardTitle>
          </div>
          <CardDescription>
            We encountered an error while checking your permissions. This might be a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted rounded-md text-sm font-mono break-all">
            {errorMessage}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleRetry} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1 gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
