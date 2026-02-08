import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useGetCallerHotelProfile, useGetRooms, useCreateRoom, useUpdateRoom } from '../../hooks/useQueries';
import { useRoomImageUpload } from '../../hooks/useRoomImageUpload';
import { formatMoney } from '../../utils/money';
import { Plus, Edit, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { RoomPhotosSection } from './RoomPhotosSection';
import { ImagePreviewDialog } from '../common/ImagePreviewDialog';

export function RoomsPanel() {
  const { data: hotelProfile } = useGetCallerHotelProfile();
  const hotelId = hotelProfile?.id;
  
  const { data: rooms, isLoading } = useGetRooms(
    { hotelId: hotelId || null },
    { enabled: !!hotelId }
  );

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const { uploadImages, isUploading } = useRoomImageUpload();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadError, setUploadError] = useState('');

  const resetForm = () => {
    setRoomNumber('');
    setRoomType('');
    setPricePerNight('');
    setCurrency('IDR');
    setSelectedFiles(null);
    setEditingRoom(null);
    setUploadError('');
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType);
    setPricePerNight(room.pricePerNight.toString());
    setCurrency(room.currency);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    try {
      let pictureUrls: string[] = editingRoom?.pictures || [];

      if (selectedFiles && selectedFiles.length > 0) {
        // Convert FileList to File[]
        const filesArray = Array.from(selectedFiles);
        pictureUrls = await uploadImages(filesArray);
      }

      const roomData = {
        roomNumber,
        roomType,
        pricePerNight: BigInt(pricePerNight),
        currency,
        pictures: pictureUrls,
      };

      if (editingRoom) {
        await updateRoom.mutateAsync({
          roomId: editingRoom.id,
          ...roomData,
        });
        toast.success('Room updated successfully');
      } else {
        await createRoom.mutateAsync(roomData);
        toast.success('Room created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save room';
      setUploadError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rooms</CardTitle>
            <CardDescription>Manage your hotel rooms</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                <DialogDescription>
                  {editingRoom ? 'Update room details' : 'Create a new room for your hotel'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="101"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomType">Room Type</Label>
                  <Input
                    id="roomType"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    placeholder="Deluxe, Standard, Suite..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Night</Label>
                    <Input
                      id="price"
                      type="number"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      placeholder="100000"
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
                  <Label htmlFor="pictures">
                    <ImageIcon className="h-4 w-4 inline mr-1" />
                    Room Photos
                  </Label>
                  <Input
                    id="pictures"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {editingRoom ? 'Upload new photos to replace existing ones' : 'Select one or more images'}
                  </p>
                </div>

                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createRoom.isPending || updateRoom.isPending || isUploading}
                >
                  {isUploading ? 'Uploading images...' : editingRoom ? 'Update Room' : 'Create Room'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading rooms...</p>
          </div>
        ) : !rooms || rooms.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No rooms yet. Add your first room to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id.toString()}>
                    <TableCell className="font-medium">{room.roomNumber}</TableCell>
                    <TableCell>{room.roomType}</TableCell>
                    <TableCell className="font-semibold">{formatMoney(room.pricePerNight, room.currency)}</TableCell>
                    <TableCell>
                      <RoomPhotosSection 
                        pictures={room.pictures} 
                        roomNumber={room.roomNumber}
                        compact 
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(room)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
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
