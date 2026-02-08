import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetRooms, useCreateRoom, useUpdateRoom } from '../../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import { Plus, Edit, Image as ImageIcon, X } from 'lucide-react';
import { SUPPORTED_CURRENCIES, formatMoney } from '../../utils/money';

export function RoomsPanel() {
  const { identity } = useInternetIdentity();
  const { data: rooms } = useGetRooms({ hotelId: identity?.getPrincipal() as any as Principal });
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [pictures, setPictures] = useState<string[]>([]);

  const myRooms = rooms?.filter((r) => r.hotelId.toString() === identity?.getPrincipal().toString()) || [];

  const handleOpenDialog = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      setRoomNumber(room.roomNumber);
      setRoomType(room.roomType);
      setPricePerNight(room.pricePerNight.toString());
      setCurrency(room.currency);
      setPictures(room.pictures || []);
    } else {
      setEditingRoom(null);
      setRoomNumber('');
      setRoomType('');
      setPricePerNight('');
      setCurrency('IDR');
      setPictures([]);
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
        setPictures((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePicture = (index: number) => {
    setPictures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRoom) {
        await updateRoom.mutateAsync({
          roomId: editingRoom.id,
          roomNumber,
          roomType,
          pricePerNight: BigInt(pricePerNight),
          currency,
          pictures,
        });
        toast.success('Room updated successfully');
      } else {
        await createRoom.mutateAsync({
          roomNumber,
          roomType,
          pricePerNight: BigInt(pricePerNight),
          currency,
          pictures,
        });
        toast.success('Room created successfully');
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save room');
    }
  };

  return (
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
                  {editingRoom ? 'Update room details' : 'Create a new room for your hotel'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="roomType">Room Type</Label>
                  <Input
                    id="roomType"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    required
                    placeholder="e.g., Standard, Suite, Deluxe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pricePerNight">Price Per Night</Label>
                    <Input
                      id="pricePerNight"
                      type="number"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pictures" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Room Photos
                  </Label>
                  <Input
                    id="pictures"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload multiple photos to showcase your room (JPEG, PNG)
                  </p>
                </div>

                {pictures.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Photos ({pictures.length})</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {pictures.map((pic, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={pic}
                            alt={`Room ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePicture(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={createRoom.isPending || updateRoom.isPending} className="w-full">
                  {createRoom.isPending || updateRoom.isPending
                    ? 'Saving...'
                    : editingRoom
                      ? 'Update Room'
                      : 'Create Room'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {myRooms.length === 0 ? (
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
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRooms.map((room) => (
                  <TableRow key={room.id.toString()}>
                    <TableCell className="font-medium">{room.roomNumber}</TableCell>
                    <TableCell>{room.roomType}</TableCell>
                    <TableCell className="font-semibold">{formatMoney(room.pricePerNight, room.currency)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {room.pictures?.length || 0} photo{room.pictures?.length !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(room)} className="gap-2">
                        <Edit className="h-4 w-4" />
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
