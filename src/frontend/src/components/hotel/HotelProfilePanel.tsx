import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGetCallerHotelProfile, useUpdateHotelProfile } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Building2, MapPin, MapPinned, Link as LinkIcon, MessageCircle, Mail, Loader2 } from 'lucide-react';

export function HotelProfilePanel() {
  const { data: hotelProfile, isLoading: profileLoading, refetch } = useGetCallerHotelProfile();
  const updateProfile = useUpdateHotelProfile();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (hotelProfile) {
      setName(hotelProfile.name);
      setLocation(hotelProfile.location);
      setAddress(hotelProfile.address || '');
      setMapLink(hotelProfile.mapLink || '');
      setWhatsapp(hotelProfile.contact.whatsapp || '');
      setEmail(hotelProfile.contact.email || '');
    }
  }, [hotelProfile]);

  const validateMapLink = (url: string): boolean => {
    if (!url) return true;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateWhatsApp = (number: string): boolean => {
    if (!number) return true;
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const validateEmail = (emailAddr: string): boolean => {
    if (!emailAddr) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailAddr);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Hotel name is required');
      return;
    }

    if (!location.trim()) {
      toast.error('Location is required');
      return;
    }

    if (!address.trim()) {
      toast.error('Address is required');
      return;
    }

    if (mapLink && !validateMapLink(mapLink)) {
      toast.error('Please enter a valid map link (must start with http:// or https://)');
      return;
    }

    if (whatsapp && !validateWhatsApp(whatsapp)) {
      toast.error('Please enter a valid WhatsApp number (10-15 digits)');
      return;
    }

    if (email && !validateEmail(email)) {
      toast.error('Please enter a valid email address');
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
      
      toast.success('Hotel profile updated successfully');
      
      // Refetch to ensure UI is in sync
      await refetch();
    } catch (error: any) {
      console.error('Failed to update hotel profile:', error);
      toast.error(error?.message || 'Failed to update hotel profile');
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle>Hotel Profile</CardTitle>
        <CardDescription>Update your hotel information and contact details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Hotel Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Hotel Dummy"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Indonesia"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPinned className="h-4 w-4" />
            Address
          </Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="J. Raya Pajajaran Bogor"
            required
          />
          <p className="text-sm text-muted-foreground">Complete address for guests to find your hotel</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mapLink" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Map Link (Optional)
          </Label>
          <Input
            id="mapLink"
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
            placeholder="https://www.google.com/maps/place/..."
          />
          <p className="text-sm text-muted-foreground">
            Link to Google Maps or other map service for easy navigation
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information for Guests</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These contact details will be shown to guests when they book your hotel
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Number (Optional)
              </Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g., 628123456789"
              />
              <p className="text-sm text-muted-foreground">
                Include country code without + or spaces (e.g., 628123456789)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address (Optional)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hotel@example.com"
              />
              <p className="text-sm text-muted-foreground">
                Email address for guest inquiries and booking confirmations
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="w-full"
          size="lg"
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
