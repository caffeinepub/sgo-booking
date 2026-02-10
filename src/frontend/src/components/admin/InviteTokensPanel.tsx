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
import type { InviteToken } from '../../types/extended-backend';

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
              value={hotelPrincipal}
              onChange={(e) => handlePrincipalChange(e.target.value)}
              placeholder="e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              className={principalError ? 'border-destructive' : ''}
            />
            {principalError && <p className="text-sm text-destructive mt-1">{principalError}</p>}
          </div>

          <div>
            <Label htmlFor="maxUses">Max Uses</Label>
            <Input
              id="maxUses"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>

          <Button onClick={handleGenerateToken} disabled={createToken.isPending || !!principalError} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {createToken.isPending ? 'Generating...' : 'Generate Token'}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tokensList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tokens generated yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokensList.map((token) => (
                  <TableRow key={token.token}>
                    <TableCell className="font-mono text-sm max-w-xs truncate">
                      {token.token}
                    </TableCell>
                    <TableCell>
                      <Badge variant={token.isActive ? 'default' : 'secondary'}>
                        {token.isActive ? 'Active' : 'Used'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {token.usageCount.toString()} / {token.maxUses.toString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyToken(token.token)}>
                        <Copy className="h-4 w-4" />
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
