import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { useActor } from '../../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Principal } from '@icp-sdk/core/principal';
import { Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function DataCleanupPanel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  const [hotelPrincipal, setHotelPrincipal] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCleaningPhotos, setIsCleaningPhotos] = useState(false);
  const [isCleaningPayments, setIsCleaningPayments] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<string[]>([]);

  const handleCleanLegacyRoomPhotos = async () => {
    if (!actor) {
      toast.error('Actor not available');
      return;
    }

    if (!hotelPrincipal.trim() || !roomId.trim()) {
      toast.error('Please enter both hotel principal and room ID');
      return;
    }

    setIsCleaningPhotos(true);
    try {
      const hotelId = Principal.fromText(hotelPrincipal.trim());
      const roomIdBigInt = BigInt(roomId.trim());
      
      await (actor as any).adminRemoveLegacyRoomPhotos(hotelId, roomIdBigInt);
      
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      const result = `✓ Removed legacy photos from room ${roomId} in hotel ${hotelPrincipal.slice(0, 10)}...`;
      setCleanupResults((prev) => [...prev, result]);
      toast.success('Legacy room photos removed successfully');
      setRoomId('');
    } catch (error: any) {
      console.error('Failed to clean legacy room photos:', error);
      toast.error(error.message || 'Failed to remove legacy room photos');
    } finally {
      setIsCleaningPhotos(false);
    }
  };

  const handleCleanLegacyPaymentMethods = async () => {
    if (!actor) {
      toast.error('Actor not available');
      return;
    }

    if (!hotelPrincipal.trim()) {
      toast.error('Please enter hotel principal');
      return;
    }

    setIsCleaningPayments(true);
    try {
      const hotelId = Principal.fromText(hotelPrincipal.trim());
      
      await (actor as any).adminRemoveLegacyPaymentMethods(hotelId);
      
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      
      const result = `✓ Removed all legacy payment methods from hotel ${hotelPrincipal.slice(0, 10)}...`;
      setCleanupResults((prev) => [...prev, result]);
      toast.success('Legacy payment methods removed successfully');
    } catch (error: any) {
      console.error('Failed to clean legacy payment methods:', error);
      toast.error(error.message || 'Failed to remove legacy payment methods');
    } finally {
      setIsCleaningPayments(false);
    }
  };

  const handleClearResults = () => {
    setCleanupResults([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Cleanup Utility</CardTitle>
        <CardDescription>
          Admin-only tool to remove legacy data (old room photos and payment methods) without affecting current features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This is a one-time cleanup utility. Use with caution. 
            Make sure you have the correct hotel principal ID before proceeding.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hotelPrincipal">Hotel Principal ID *</Label>
            <Input
              id="hotelPrincipal"
              placeholder="e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              value={hotelPrincipal}
              onChange={(e) => setHotelPrincipal(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The principal ID of the hotel that needs cleanup
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Remove Legacy Room Photos</h3>
            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                id="roomId"
                type="number"
                placeholder="e.g., 0, 1, 2..."
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The ID of the room with legacy photos. Repeat for each room with old photos.
              </p>
            </div>
            <Button
              onClick={handleCleanLegacyRoomPhotos}
              disabled={isCleaningPhotos || !hotelPrincipal.trim() || !roomId.trim()}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isCleaningPhotos ? 'Removing Photos...' : 'Remove Room Photos'}
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Remove All Legacy Payment Methods</h3>
            <p className="text-xs text-muted-foreground">
              This will remove ALL payment methods from the hotel. The hotel can add new ones afterward.
            </p>
            <Button
              onClick={handleCleanLegacyPaymentMethods}
              disabled={isCleaningPayments || !hotelPrincipal.trim()}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isCleaningPayments ? 'Removing Payment Methods...' : 'Remove All Payment Methods'}
            </Button>
          </div>
        </div>

        {cleanupResults.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Cleanup Results</h3>
                <Button variant="ghost" size="sm" onClick={handleClearResults}>
                  Clear
                </Button>
              </div>
              <div className="space-y-1 bg-muted p-3 rounded-md max-h-48 overflow-y-auto">
                {cleanupResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{result}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> After cleanup, the hotel owner can add new payment methods via the Hotel Area → Payments tab.
            Room photos can be managed via Hotel Area → Rooms tab.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
