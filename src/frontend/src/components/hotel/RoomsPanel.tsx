import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useGetCallerHotelProfile, useGetRooms, useCreateRoom, useUpdateRoom } from '../../hooks/useQueries';
import { useRoomImageUpload } from '../../hooks/useRoomImageUpload';
import { toast } from 'sonner';
import { Plus, Edit, Image as ImageIcon, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatMoney } from '../../utils/money';

const SUPPORTED_CURRENCIES = [
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
] as const;

export function RoomsPanel() {
  const { data: hotelProfile, isLoading: profileLoading, error: profileError } = useGetCallerHotelProfile();
  const hotelId = hotelProfile?.id;
  
  const { data: rooms, isLoading: roomsLoading, error: roomsError, refetch: refetchRooms } = useGetRooms(
    { hotelId: hotelId || undefined },
    { enabled: !!hotelId }
  );
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const { uploadImagesFromDataUrls, isUploading, uploadProgress } = useRoomImageUpload();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [pictureDataUrls, setPictureDataUrls] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const myRooms = rooms?.filter((r) => r.hotelId.toString() === hotelId?.toString()) || [];

  const handleOpenDialog = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      setRoomNumber(room.roomNumber);
      setRoomType(room.roomType);
      setPricePerNight(room.pricePerNight.toString());
      setCurrency(room.currency);
      setPictureDataUrls(room.pictures || []);
    } else {
      setEditingRoom(null);
      setRoomNumber('');
      setRoomType('');
      setPricePerNight('');
      setCurrency('IDR');
      setPictureDataUrls([]);
    }
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPictureDataUrls((prev) => [...prev, dataUrl]);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file. Please try again.');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePicture = (index: number) => {
    setPictureDataUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomNumber.trim() || !roomType.trim() || !pricePerNight) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const pictureUrls = await uploadImagesFromDataUrls(pictureDataUrls);

      if (editingRoom) {
        await updateRoom.mutateAsync({
          roomId: editingRoom.id,
          roomNumber,
          roomType,
          pricePerNight: BigInt(pricePerNight),
          currency,
          pictures: pictureUrls,
        });
        toast.success('Room updated successfully');
      } else {
        await createRoom.mutateAsync({
          roomNumber,
          roomType,
          pricePerNight: BigInt(pricePerNight),
          currency,
          pictures: pictureUrls,
        });
        toast.success('Room created successfully');
      }
      
      // Force immediate refetch to show updated room list with photos
      await refetchRooms();
      
      setIsDialogOpen(false);
      setEditingRoom(null);
      setRoomNumber('');
      setRoomType('');
      setPricePerNight('');
      setCurrency('IDR');
      setPictureDataUrls([]);
    } catch (error: any) {
      console.error('Room save error:', error);
      toast.error(error.message || 'Failed to save room. Please try again.');
    }
  };

  const isSaving = createRoom.isPending || updateRoom.isPending || isUploading;

  if (profileLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading hotel profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (profileError) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Hotel Profile</AlertTitle>
            <AlertDescription>
              {profileError instanceof Error ? profileError.message : 'Failed to load hotel profile. Please try refreshing the page.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!hotelId) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hotel Profile Required</AlertTitle>
            <AlertDescription>
              Please complete your hotel profile setup before managing rooms.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rooms</CardTitle>
              <CardDescription>Manage your hotel rooms and offers</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                  <DialogDescription>
                    {editingRoom ? 'Update room details below' : 'Fill in the details to create a new room'}
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomType">Room Type *</Label>
                      <Input
                        id="roomType"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        placeholder="e.g., Standard, Deluxe"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricePerNight">Price per Night *</Label>
                      <Input
                        id="pricePerNight"
                        type="number"
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(e.target.value)}
                        placeholder="e.g., 500000"
                        required
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency *</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.symbol} {curr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pictures">Room Pictures</Label>
                    <Input
                      id="pictures"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={isSaving}
                    />
                    {pictureDataUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {pictureDataUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setPreviewImage(url)}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemovePicture(index)}
                              disabled={isSaving}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {isUploading && (
                      <div className="text-sm text-muted-foreground">
                        Uploading images... {uploadProgress}%
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving} className="gap-2">
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editingRoom ? 'Update Room' : 'Create Room'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {roomsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading rooms...</p>
            </div>
          ) : roomsError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Rooms</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{roomsError instanceof Error ? roomsError.message : 'Failed to load rooms. Please try again.'}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchRooms()}
                  className="gap-2 mt-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : rooms && rooms.length > 0 && myRooms.length === 0 ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unexpected Results</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Rooms were found but none belong to your hotel. This may indicate a data sync issue.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchRooms()}
                  className="gap-2 mt-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : myRooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No rooms yet. Click "Add Room" to create your first room.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price per Night</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRooms.map((room) => (
                  <TableRow key={room.id.toString()}>
                    <TableCell className="font-medium">{room.roomNumber}</TableCell>
                    <TableCell>{room.roomType}</TableCell>
                    <TableCell>{formatMoney(room.pricePerNight, room.currency)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm">{room.pictures?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(room)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            <div className="relative w-full">
              <img
                src={previewImage}
                alt="Room preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
