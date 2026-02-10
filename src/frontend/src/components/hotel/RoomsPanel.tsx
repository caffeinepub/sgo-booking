import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useCreateRoom, useUpdateRoom, useDeleteRoom, useGetCallerHotelProfile } from '../../hooks/useQueries';
import { useRoomImageUpload } from '../../hooks/useRoomImageUpload';
import { toast } from 'sonner';
import type { RoomView, RoomInput } from '../../types/extended-backend';
import { RoomPhotosSection } from './RoomPhotosSection';
import { validatePromoPercent, computeDiscountedPrice } from '../../utils/roomPricing';

export function RoomsPanel() {
  const { data: hotelProfile, isLoading: profileLoading } = useGetCallerHotelProfile();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const { uploadImages, uploadSingleImage, uploading: imageUploading, error: uploadError } = useRoomImageUpload();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomView | null>(null);
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState<RoomView | null>(null);

  const [roomType, setRoomType] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [promoPercent, setPromoPercent] = useState('0');
  const [currency, setCurrency] = useState('IDR');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingPictures, setExistingPictures] = useState<string[]>([]);

  const rooms = hotelProfile?.rooms || [];

  const resetForm = () => {
    setRoomType('');
    setPricePerNight('');
    setPromoPercent('0');
    setCurrency('IDR');
    setSelectedFiles([]);
    setExistingPictures([]);
    setEditingRoom(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (room: RoomView) => {
    setEditingRoom(room);
    setRoomType(room.roomType);
    setPricePerNight(room.pricePerNight.toString());
    setPromoPercent(room.promoPercent.toString());
    setCurrency(room.currency);
    setExistingPictures(room.pictures);
    setSelectedFiles([]);
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handlePhotoDelete = (photoUrl: string) => {
    setExistingPictures((prev) => prev.filter((url) => url !== photoUrl));
  };

  const handlePhotoReplace = async (oldPhotoUrl: string, newFile: File) => {
    try {
      const newUrl = await uploadSingleImage(newFile);
      setExistingPictures((prev) => prev.map((url) => (url === oldPhotoUrl ? newUrl : url)));
      toast.success('Photo replaced successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to replace photo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = BigInt(pricePerNight);
    const promo = BigInt(promoPercent);

    if (!validatePromoPercent(promo)) {
      toast.error('Promo percent must be between 0 and 100');
      return;
    }

    try {
      let finalPictures = [...existingPictures];

      // Upload new files if any
      if (selectedFiles.length > 0) {
        const newUrls = await uploadImages(selectedFiles);
        finalPictures = [...finalPictures, ...newUrls];
        toast.success(`${selectedFiles.length} photo(s) uploaded successfully`);
      }

      const discountedPrice = computeDiscountedPrice(price, promo);

      const input: RoomInput = {
        roomType,
        pricePerNight: price,
        promoPercent: promo,
        currency,
        pictures: finalPictures,
      };

      if (editingRoom) {
        await updateRoom.mutateAsync({ roomId: editingRoom.id, input });
        toast.success('Room updated successfully');
      } else {
        await createRoom.mutateAsync(input);
        toast.success('Room created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save room');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmRoom) return;

    try {
      await deleteRoom.mutateAsync(deleteConfirmRoom.id);
      toast.success('Room deleted successfully');
      setDeleteConfirmRoom(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room');
    }
  };

  const currentPromo = BigInt(promoPercent || '0');
  const currentPrice = BigInt(pricePerNight || '0');
  const discountedPrice = validatePromoPercent(currentPromo) ? computeDiscountedPrice(currentPrice, currentPromo) : currentPrice;

  if (profileLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Room Management</CardTitle>
              <CardDescription>Manage your hotel rooms and pricing</CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No rooms added yet. Click "Add Room" to create your first room.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card key={room.id.toString()}>
                  <CardHeader>
                    <CardTitle className="text-lg">{room.roomType}</CardTitle>
                    <CardDescription>
                      {room.currency} {room.pricePerNight.toLocaleString()} / night
                      {room.promoPercent > 0 && (
                        <span className="block text-sm text-green-600 dark:text-green-400 mt-1">
                          {room.promoPercent}% off → {room.currency} {room.discountedPrice.toLocaleString()}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RoomPhotosSection
                      pictures={room.pictures}
                      roomType={room.roomType}
                      editable={true}
                      onPhotoDelete={handlePhotoDelete}
                      onPhotoReplace={handlePhotoReplace}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(room)} className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteConfirmRoom(room)} className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update room details and pricing' : 'Create a new room for your hotel'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              <Input
                id="roomType"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                placeholder="e.g., Deluxe Suite, Standard Room"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerNight">Price per Night</Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  min="0"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoPercent">Promo Discount (%)</Label>
              <Input
                id="promoPercent"
                type="number"
                min="0"
                max="100"
                value={promoPercent}
                onChange={(e) => setPromoPercent(e.target.value)}
              />
              {currentPromo > 0 && validatePromoPercent(currentPromo) && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Discounted price: {currency} {discountedPrice.toLocaleString()} / night
                </p>
              )}
            </div>

            {editingRoom && existingPictures.length > 0 && (
              <div className="space-y-2">
                <Label>Current Photos</Label>
                <RoomPhotosSection
                  pictures={existingPictures}
                  roomType={roomType}
                  editable={true}
                  onPhotoDelete={handlePhotoDelete}
                  onPhotoReplace={handlePhotoReplace}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="photos">{editingRoom ? 'Add More Photos' : 'Room Photos'}</Label>
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
              {selectedFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
                disabled={createRoom.isPending || updateRoom.isPending || imageUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createRoom.isPending || updateRoom.isPending || imageUploading}
              >
                {(createRoom.isPending || updateRoom.isPending || imageUploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {imageUploading ? 'Uploading...' : editingRoom ? 'Update Room' : 'Create Room'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmRoom} onOpenChange={() => setDeleteConfirmRoom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmRoom?.roomType}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteRoom.isPending}>
              {deleteRoom.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
