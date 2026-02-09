import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useGetCallerHotelProfile, useUpdateHotelProfile } from '../../hooks/useQueries';
import { Building2, MapPin, Map, MessageCircle, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function HotelProfilePanel() {
  const { data: hotelProfile, isLoading, refetch } = useGetCallerHotelProfile();
  const updateProfile = useUpdateHotelProfile();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (hotelProfile) {
      setName(hotelProfile.name || '');
      setLocation(hotelProfile.location || '');
      setAddress(hotelProfile.address || '');
      setMapLink(hotelProfile.mapLink || '');
      setWhatsapp(hotelProfile.contact?.whatsapp || '');
      setEmail(hotelProfile.contact?.email || '');
    }
  }, [hotelProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !location.trim() || !address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        location: location.trim(),
        address: address.trim(),
        mapLink: mapLink.trim() || '',
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
      });

      await refetch();
      toast.success('Hotel profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update hotel profile');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hotel Profile</CardTitle>
          <CardDescription>Loading profile...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Profile</CardTitle>
        <CardDescription>
          Manage your hotel's basic information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                <Building2 className="h-4 w-4 inline mr-1" />
                Hotel Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter hotel name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location *
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Bali, Indonesia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                <Map className="h-4 w-4 inline mr-1" />
                Address *
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full street address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapLink">
                <Map className="h-4 w-4 inline mr-1" />
                Map Link (Optional)
              </Label>
              <Input
                id="mapLink"
                type="url"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                <MessageCircle className="h-4 w-4 inline mr-1" />
                WhatsApp Number (Optional)
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+62 812 3456 7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address (Optional)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hotel@example.com"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>

          {updateProfile.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {updateProfile.error.message || 'Failed to update profile'}
              </AlertDescription>
            </Alert>
          )}

          {updateProfile.isSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
