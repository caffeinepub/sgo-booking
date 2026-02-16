import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Copy, Plus, Loader2, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useCreateInviteToken, useGetInviteTokens } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Principal } from '@icp-sdk/core/principal';

export function InviteTokensPanel() {
  const { data: tokens, isLoading } = useGetInviteTokens();
  const createToken = useCreateInviteToken();

  const [maxUses, setMaxUses] = useState('1');
  const [boundPrincipal, setBoundPrincipal] = useState('');

  const handleCreateToken = async () => {
    try {
      const principal = boundPrincipal.trim() ? Principal.fromText(boundPrincipal.trim()) : null;
      const token = await createToken.mutateAsync({
        maxUses: BigInt(maxUses),
        boundPrincipal: principal,
      });
      
      toast.success('Invite code generated successfully');
      setMaxUses('1');
      setBoundPrincipal('');
    } catch (error: any) {
      console.error('Token generation error:', error);
      toast.error(error.message || 'Failed to generate invite code');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const activeTokens = tokens?.filter((t) => t.isActive) || [];
  const usedTokens = tokens?.filter((t) => !t.isActive) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Invite Code</CardTitle>
          <CardDescription>Create invite codes for new hotel accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Each token must be bound to a specific hotel's Internet Identity Principal. The hotel owner must provide their Principal ID before you generate their activation token.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Maximum Uses</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boundPrincipal">Hotel Principal (Optional)</Label>
              <Input
                id="boundPrincipal"
                type="text"
                placeholder="Leave empty for any principal"
                value={boundPrincipal}
                onChange={(e) => setBoundPrincipal(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleCreateToken} disabled={createToken.isPending} className="w-full">
            {createToken.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate Invite Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Invite Codes</CardTitle>
          <CardDescription>Codes that can still be used</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTokens.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active invite codes</p>
          ) : (
            <div className="space-y-3">
              {activeTokens.map((token) => (
                <div key={token.token} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{token.token}</code>
                      <Badge variant="default">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Uses: {token.usageCount.toString()} / {token.maxUses.toString()}
                      {token.boundPrincipal && (
                        <span className="ml-2">
                          • Bound to: {token.boundPrincipal.toString().slice(0, 10)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(token.token)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Used Invite Codes</CardTitle>
          <CardDescription>Codes that have been consumed</CardDescription>
        </CardHeader>
        <CardContent>
          {usedTokens.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No used invite codes</p>
          ) : (
            <div className="space-y-3">
              {usedTokens.map((token) => (
                <div key={token.token} className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{token.token}</code>
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Used
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Uses: {token.usageCount.toString()} / {token.maxUses.toString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
