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
import { Trash2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
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
        <CardTitle>Legacy Data Cleanup Utility</CardTitle>
        <CardDescription>
          Remove ghost room photos and undeletable legacy payment methods (GOPAY, email-as-payment-method) without affecting current hotel data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This utility removes legacy data that cannot be deleted through normal UI flows. 
            Verify the hotel principal ID before proceeding. Active hotel token: <code className="text-xs">HOTEL_17705984310722985941</code>
          </AlertDescription>
        </Alert>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Verification Steps After Cleanup:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Guest Browse Hotels: Verify NO ghost room photos appear</li>
              <li>Hotel Detail Page: Verify ONLY current room photos are shown</li>
              <li>Hotel Area → Payments: Verify GOPAY and email-as-payment-method are removed</li>
              <li>Hotel Area → Rooms: Verify current rooms and photos remain intact</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hotelPrincipal">Hotel Principal ID *</Label>
            <Input
              id="hotelPrincipal"
              placeholder="e.g., opo7v-ka45k-pk32j-76qsi-o3ngz-e6tgc-755di-t2vx3-t2ugj-qnpbc-gae"
              value={hotelPrincipal}
              onChange={(e) => setHotelPrincipal(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The principal ID of the hotel with legacy data. Find this in Admin Panel → Invite Tokens (Bound Principal column).
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Remove Ghost Room Photos</h3>
            <p className="text-xs text-muted-foreground">
              Use this to remove old room photos that still appear in Guest/Admin views but are not visible in Hotel Portal.
            </p>
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
                The ID of the room with ghost photos. Repeat this action for each affected room.
              </p>
            </div>
            <Button
              onClick={handleCleanLegacyRoomPhotos}
              disabled={isCleaningPhotos || !hotelPrincipal.trim() || !roomId.trim()}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isCleaningPhotos ? 'Removing Photos...' : 'Remove Ghost Room Photos'}
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Remove Legacy Payment Methods</h3>
            <p className="text-xs text-muted-foreground">
              This removes ALL payment methods including undeletable legacy entries (GOPAY, email-as-payment-method). 
              The hotel can add new payment methods afterward via Hotel Area → Payments tab.
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
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Post-Cleanup Actions:</strong> After running cleanup, re-check Guest Browse Hotels, Admin views, and Hotel Area → Payments 
            to confirm ghost photos and legacy payment methods (GOPAY, email-as-payment-method) are no longer visible. 
            Hotel owners can add new payment methods via Hotel Area → Payments tab.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
