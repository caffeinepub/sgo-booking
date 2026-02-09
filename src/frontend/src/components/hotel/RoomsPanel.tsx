import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit, Loader2, AlertCircle } from 'lucide-react';
import { useCreateRoom, useUpdateRoom, useGetCallerHotelProfile } from '../../hooks/useQueries';
import { useRoomImageUpload } from '../../hooks/useRoomImageUpload';
import { toast } from 'sonner';
import type { RoomView } from '../../types/extended-backend';
import { RoomPhotosSection } from './RoomPhotosSection';

export function RoomsPanel() {
  const { data: hotelProfile } = useGetCallerHotelProfile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomView | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const { uploadImages, isUploading, uploadProgress } = useRoomImageUpload();

  const resetForm = () => {
    setRoomNumber('');
    setRoomType('');
    setPricePerNight('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!roomNumber.trim() || !roomType.trim() || !pricePerNight.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = BigInt(Math.round(parseFloat(pricePerNight)));
    if (price <= 0) {
      toast.error('Price must be greater than 0');
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

      if (editingRoom) {
        await updateRoom.mutateAsync({
          roomId: editingRoom.id,
          roomNumber: roomNumber.trim(),
          roomType: roomType.trim(),
          pricePerNight: price,
          currency,
          pictures: pictureUrls,
        });
        toast.success('Room updated successfully');
      } else {
        await createRoom.mutateAsync({
          roomNumber: roomNumber.trim(),
          roomType: roomType.trim(),
          pricePerNight: price,
          currency,
          pictures: pictureUrls,
        });
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
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType);
    setPricePerNight(room.pricePerNight.toString());
    setCurrency(room.currency);
    setSelectedFiles([]);
    setUploadError(null);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsAddDialogOpen(open);
  };

  const isPending = createRoom.isPending || updateRoom.isPending || isUploading;
  const rooms = hotelProfile?.rooms || [];

  return (
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number *</Label>
                    <Input
                      id="roomNumber"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g., 101"
                      disabled={isPending}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomType">Room Type *</Label>
                    <Input
                      id="roomType"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      placeholder="e.g., Deluxe"
                      disabled={isPending}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Night *</Label>
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
                      <CardTitle className="text-lg">
                        Room {room.roomNumber} - {room.roomType}
                      </CardTitle>
                      <CardDescription>
                        {room.currency} {room.pricePerNight.toString()} per night
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(room)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <RoomPhotosSection pictures={room.pictures} roomNumber={room.roomNumber} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
