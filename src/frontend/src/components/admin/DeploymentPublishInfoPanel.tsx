import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Copy, Check, Globe, Code } from 'lucide-react';
import { BUILD_VERSION } from '../../buildInfo';
import { toast } from 'sonner';

/**
 * Admin-only panel displaying deployment and publish information including
 * build version, current URL, and runtime environment details with copy-to-clipboard functionality.
 */
export function DeploymentPublishInfoPanel() {
  const [copiedItem, setCopiedItem] = React.useState<string | null>(null);

  const currentUrl = `${window.location.origin}${window.location.pathname}`;
  const hostname = window.location.hostname;

  // Detect if running on IC network
  const isIcNetwork = hostname.includes('.ic0.app') || hostname.includes('.icp0.io') || hostname.includes('.raw.icp0.io');
  const networkInfo = isIcNetwork ? 'Internet Computer Network' : 'Local Development';

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const InfoRow = ({ 
    label, 
    value, 
    icon: Icon 
  }: { 
    label: string; 
    value: string; 
    icon: React.ElementType;
  }) => (
    <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
          <div className="text-sm font-mono break-all">{value}</div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCopy(value, label)}
        className="flex-shrink-0"
      >
        {copiedItem === label ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Deployment & Publish Info
        </CardTitle>
        <CardDescription>
          Current build version and runtime environment information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow
          label="Build Version"
          value={BUILD_VERSION}
          icon={Code}
        />
        <InfoRow
          label="Current URL"
          value={currentUrl}
          icon={Globe}
        />
        <InfoRow
          label="Hostname"
          value={hostname}
          icon={Globe}
        />
        <InfoRow
          label="Network"
          value={networkInfo}
          icon={Globe}
        />
      </CardContent>
    </Card>
  );
}
