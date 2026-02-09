import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useGetInviteTokens, useCreateInviteToken } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Plus, Copy, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Principal } from '@icp-sdk/core/principal';
import type { InviteToken } from '../../backend';

export function InviteTokensPanel() {
  const { data: tokens, isLoading } = useGetInviteTokens();
  const createToken = useCreateInviteToken();
  const [maxUses, setMaxUses] = useState('1');
  const [hotelPrincipal, setHotelPrincipal] = useState('');
  const [principalError, setPrincipalError] = useState('');

  const validatePrincipal = (value: string): boolean => {
    if (!value.trim()) {
      setPrincipalError('Hotel Principal is required');
      return false;
    }

    try {
      Principal.fromText(value.trim());
      setPrincipalError('');
      return true;
    } catch (error) {
      setPrincipalError('Invalid Principal format');
      return false;
    }
  };

  const handlePrincipalChange = (value: string) => {
    setHotelPrincipal(value);
    if (value.trim()) {
      validatePrincipal(value);
    } else {
      setPrincipalError('');
    }
  };

  const handleGenerateToken = async () => {
    if (!validatePrincipal(hotelPrincipal)) {
      return;
    }

    try {
      const principal = Principal.fromText(hotelPrincipal.trim());
      await createToken.mutateAsync({
        maxUses: BigInt(maxUses),
        boundPrincipal: principal,
      });
      toast.success('Invite token generated successfully');
      setHotelPrincipal('');
      setPrincipalError('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate token');
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Token copied to clipboard');
  };

  const tokensList: InviteToken[] = tokens || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Hotel Invite Management</CardTitle>
            <CardDescription>Generate and manage invite tokens for hotel registration</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Each token must be bound to a specific hotel's Internet Identity Principal. The hotel owner must provide
            their Principal ID before you generate their activation token.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label htmlFor="hotelPrincipal">
              Hotel Principal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="hotelPrincipal"
              type="text"
              value={hotelPrincipal}
              onChange={(e) => handlePrincipalChange(e.target.value)}
              placeholder="Enter hotel's Internet Identity Principal"
              className={principalError ? 'border-destructive' : ''}
            />
            {principalError && <p className="text-sm text-destructive mt-1">{principalError}</p>}
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="maxUses">Max Uses</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="1"
              />
            </div>
            <Button
              onClick={handleGenerateToken}
              disabled={createToken.isPending || !hotelPrincipal.trim() || !!principalError}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Generate Token
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading tokens...</p>
          </div>
        ) : tokensList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No invite tokens yet. Generate one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Bound Principal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokensList.map((token) => (
                  <TableRow key={token.token}>
                    <TableCell className="font-mono text-sm max-w-xs truncate">{token.token}</TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">
                      {token.boundPrincipal ? token.boundPrincipal.toString() : (
                        <span className="text-muted-foreground italic">Unbound (legacy)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={token.isActive && token.usageCount < token.maxUses ? 'default' : 'secondary'}>
                        {token.usageCount >= token.maxUses ? 'Used' : 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {token.usageCount.toString()} / {token.maxUses.toString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToken(token.token)}
                        className="gap-1"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Token
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
