import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGetCallerHotelProfile, useUpdateHotelProfile } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Building2, MapPin, MapPinned, Link as LinkIcon, MessageCircle, Mail } from 'lucide-react';

export function HotelProfilePanel() {
  const { data: hotelProfile } = useGetCallerHotelProfile();
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
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mapLink && !validateMapLink(mapLink)) {
      toast.error('Please enter a valid URL for the map link');
      return;
    }

    if (email && !validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name,
        location,
        address,
        mapLink,
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
      });
      toast.success('Hotel profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Profile</CardTitle>
        <CardDescription>Update your hotel information and contact details</CardDescription>
      </CardHeader>
      <CardContent>
        {hotelProfile ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Hotel Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="e.g., Bali, Indonesia"
              />
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPinned className="h-4 w-4" />
                Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full street address"
              />
              <p className="text-xs text-muted-foreground mt-1">Complete address for guests to find your hotel</p>
            </div>

            <div>
              <Label htmlFor="mapLink" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Map Link (Optional)
              </Label>
              <Input
                id="mapLink"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                placeholder="https://maps.google.com/..."
                type="url"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Link to Google Maps or other map service for easy navigation
              </p>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Contact Information for Guests</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  These contact details will be shown to guests when they book your hotel
                </p>
              </div>

              <div>
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Number (Optional)
                </Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g., 628123456789"
                  type="tel"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code without + or spaces (e.g., 628123456789)
                </p>
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address (Optional)
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hotel@example.com"
                  type="email"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email address for guest inquiries and booking confirmations
                </p>
              </div>
            </div>

            <Button type="submit" disabled={updateProfile.isPending} className="w-full">
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading hotel profile...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
