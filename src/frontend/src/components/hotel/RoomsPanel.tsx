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
import { formatMoney } from '../../utils/money';
import { validatePromoPercent, computeDiscountedPrice } from '../../utils/roomPricing';

export function RoomsPanel() {
  const { data: hotelProfile } = useGetCallerHotelProfile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomView | null>(null);
  const [roomType, setRoomType] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [promoPercent, setPromoPercent] = useState('0');
  const [currency, setCurrency] = useState('IDR');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState<RoomView | null>(null);

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const { uploadImages, isUploading, uploadProgress } = useRoomImageUpload();

  const resetForm = () => {
    setRoomType('');
    setPricePerNight('');
    setPromoPercent('0');
    setCurrency('IDR');
    setSelectedFiles([]);
    setEditingRoom(null);
    setUploadError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setUploadError(null);
    }
  };

  const getDiscountedPrice = (): bigint => {
    const price = BigInt(Math.round(parseFloat(pricePerNight || '0')));
    const promo = BigInt(Math.round(parseFloat(promoPercent || '0')));
    return computeDiscountedPrice(price, promo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!roomType.trim() || !pricePerNight.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = BigInt(Math.round(parseFloat(pricePerNight)));
    if (price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    const promo = BigInt(Math.round(parseFloat(promoPercent)));
    if (!validatePromoPercent(promo)) {
      toast.error('Promo percent must be between 0 and 100');
      return;
    }

    try {
      let pictureUrls: string[] = [];

      if (selectedFiles.length > 0) {
        try {
          pictureUrls = await uploadImages(selectedFiles);
        } catch (error: any) {
          setUploadError(error.message || 'Failed to upload images');
          toast.error('Image upload failed: ' + (error.message || 'Unknown error'));
          return;
        }
      } else if (editingRoom) {
        pictureUrls = editingRoom.pictures;
      }

      const roomInput: RoomInput = {
        roomType: roomType.trim(),
        pricePerNight: price,
        promoPercent: promo,
        currency,
        pictures: pictureUrls,
      };

      if (editingRoom) {
        await updateRoom.mutateAsync({
          roomId: editingRoom.id,
          input: roomInput,
        });
        toast.success('Room updated successfully');
      } else {
        await createRoom.mutateAsync(roomInput);
        toast.success('Room created successfully');
      }

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save room');
    }
  };

  const handleEdit = (room: RoomView) => {
    setEditingRoom(room);
    setRoomType(room.roomType);
    setPricePerNight(room.pricePerNight.toString());
    setPromoPercent(room.promoPercent.toString());
    setCurrency(room.currency);
    setSelectedFiles([]);
    setUploadError(null);
    setIsAddDialogOpen(true);
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

  const handlePhotoDelete = async (room: RoomView, photoUrl: string) => {
    try {
      const updatedPictures = room.pictures.filter((url) => url !== photoUrl);
      const roomInput: RoomInput = {
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        promoPercent: room.promoPercent,
        currency: room.currency,
        pictures: updatedPictures,
      };
      await updateRoom.mutateAsync({
        roomId: room.id,
        input: roomInput,
      });
      toast.success('Photo deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete photo');
    }
  };

  const handlePhotoReplace = async (room: RoomView, oldPhotoUrl: string, file: File) => {
    try {
      const newUrls = await uploadImages([file]);
      if (newUrls.length === 0) {
        throw new Error('Failed to upload replacement image');
      }
      const updatedPictures = room.pictures.map((url) => (url === oldPhotoUrl ? newUrls[0] : url));
      const roomInput: RoomInput = {
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        promoPercent: room.promoPercent,
        currency: room.currency,
        pictures: updatedPictures,
      };
      await updateRoom.mutateAsync({
        roomId: room.id,
        input: roomInput,
      });
      toast.success('Photo replaced successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to replace photo');
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsAddDialogOpen(open);
  };

  const isPending = createRoom.isPending || updateRoom.isPending || isUploading;
  const rooms = hotelProfile?.rooms || [];

  const discountedPreview = getDiscountedPrice();
  const showPromoPreview = pricePerNight && parseFloat(promoPercent) > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rooms</CardTitle>
              <CardDescription>Manage your hotel rooms and offers</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                  <DialogDescription>
                    {editingRoom ? 'Update room details and photos' : 'Create a new room with details and photos'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomType">Room Type *</Label>
                    <Input
                      id="roomType"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      placeholder="e.g., Deluxe, Standard, Suite"
                      disabled={isPending}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Base Price per Night *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(e.target.value)}
                        placeholder="e.g., 500000"
                        disabled={isPending}
                        required
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency *</Label>
                      <Select value={currency} onValueChange={setCurrency} disabled={isPending}>
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IDR">IDR (Rp)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="SGD">SGD (S$)</SelectItem>
                          <SelectItem value="BRL">BRL (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo">Promo (%) *</Label>
                    <Input
                      id="promo"
                      type="number"
                      value={promoPercent}
                      onChange={(e) => setPromoPercent(e.target.value)}
                      placeholder="e.g., 20"
                      disabled={isPending}
                      required
                      min="0"
                      max="100"
                    />
                    <p className="text-sm text-muted-foreground">Enter discount percentage (0-100)</p>
                  </div>

                  {showPromoPreview && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Price Preview:</p>
                          <p className="text-sm">
                            Base Price: <span className="line-through">{formatMoney(BigInt(Math.round(parseFloat(pricePerNight))), currency)}</span>
                          </p>
                          <p className="text-sm font-semibold text-green-600">
                            Discounted Price: {formatMoney(discountedPreview, currency)} per night
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="photos">Room Photos</Label>
                    <Input
                      id="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={isPending}
                    />
                    <p className="text-sm text-muted-foreground">
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} file(s) selected`
                        : editingRoom
                          ? `Current: ${editingRoom.pictures.length} photo(s)`
                          : 'Select one or more images'}
                    </p>
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading images... {uploadProgress}%
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {uploadError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isPending}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isUploading ? 'Uploading...' : 'Saving...'}
                        </>
                      ) : editingRoom ? (
                        'Update Room'
                      ) : (
                        'Create Room'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No rooms yet. Click "Add Room" to create your first room.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => (
                <Card key={room.id.toString()}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{room.roomType}</CardTitle>
                        <CardDescription className="space-y-1">
                          {room.promoPercent > BigInt(0) ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="line-through text-muted-foreground">
                                  {formatMoney(room.pricePerNight, room.currency)}
                                </span>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                                  {room.promoPercent.toString()}% OFF
                                </span>
                              </div>
                              <div className="font-semibold text-green-600">
                                {formatMoney(room.discountedPrice, room.currency)} per night
                              </div>
                            </>
                          ) : (
                            <div>{formatMoney(room.pricePerNight, room.currency)} per night</div>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(room)} className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmRoom(room)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RoomPhotosSection
                      pictures={room.pictures}
                      roomType={room.roomType}
                      editable={true}
                      onPhotoDelete={(photoUrl) => handlePhotoDelete(room, photoUrl)}
                      onPhotoReplace={(oldUrl, file) => handlePhotoReplace(room, oldUrl, file)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirmRoom} onOpenChange={(open) => !open && setDeleteConfirmRoom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
              {deleteConfirmRoom && (
                <div className="mt-2 font-medium">
                  Room: {deleteConfirmRoom.roomType}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
