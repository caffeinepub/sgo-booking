import React from 'react';
import { useGetHotels } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Building2, MapPin } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export function BrowseHotelsPage() {
  const { data: hotels, isLoading } = useGetHotels();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Hotels</h1>
        <p className="text-muted-foreground">Discover and book your perfect stay</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading hotels...</p>
        </div>
      ) : !hotels || hotels.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Hotels Available</CardTitle>
            <CardDescription>
              There are currently no active hotels. Please check back later or contact the administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Card key={hotel.id.toString()} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{hotel.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {hotel.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {hotel.rooms.length} room{hotel.rooms.length !== 1 ? 's' : ''} available
                  </div>
                  <Button
                    onClick={() => navigate({ to: '/browse/$hotelId', params: { hotelId: hotel.id.toString() } })}
                    className="w-full"
                  >
                    View Details & Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
