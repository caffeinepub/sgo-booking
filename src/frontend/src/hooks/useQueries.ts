import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { backendInterface, UserRole, UserProfile, InviteToken, HotelDataView, RoomView, RoomQuery, BookingRequest, BookingQuery, BookingStatus } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<UserRole>({
    queryKey: ['callerUserRole', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}

export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<boolean>({
    queryKey: ['isCurrentUserAdmin', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}

export function useIsCallerHotelActivated() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<boolean>({
    queryKey: ['isCallerHotelActivated', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.isCallerHotelActivated();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useMakeMeAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.makeMeAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCurrentUserAdmin'] });
    },
  });
}

export function useValidateInviteToken() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.validateInviteToken(token);
    },
  });
}

export function useConsumeInviteToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.consumeInviteToken(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCurrentUserAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerHotelActivated'] });
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}

export function useCreateInviteToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { maxUses: bigint; boundPrincipal: Principal | null }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createHotelInviteToken(params.maxUses, params.boundPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inviteTokens'] });
    },
  });
}

export function useGetInviteTokens() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<InviteToken[]>({
    queryKey: ['inviteTokens'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getInviteTokens();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: 1,
  });
}

export function useGetHotels() {
  const { actor, isFetching } = useActor();

  return useQuery<HotelDataView[]>({
    queryKey: ['hotels'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getHotels();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}

export function useGetCallerHotelProfile(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';
  const enabled = options?.enabled !== undefined ? options.enabled : true;

  return useQuery<HotelDataView | null>({
    queryKey: ['callerHotelProfile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerHotelProfile();
      } catch (error) {
        console.log('Hotel profile query rejected, treating as not activated:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && enabled && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
}

// Sanitize RoomQuery to convert null to undefined for backend compatibility
function sanitizeRoomQuery(filters: RoomQuery): RoomQuery {
  const sanitized: RoomQuery = {};
  
  if (filters.hotelId !== null && filters.hotelId !== undefined) {
    sanitized.hotelId = filters.hotelId;
  }
  
  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    sanitized.minPrice = filters.minPrice;
  }
  
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    sanitized.maxPrice = filters.maxPrice;
  }
  
  if (filters.roomType !== null && filters.roomType !== undefined) {
    sanitized.roomType = filters.roomType;
  }
  
  if (filters.availableOnly !== null && filters.availableOnly !== undefined) {
    sanitized.availableOnly = filters.availableOnly;
  }
  
  return sanitized;
}

export function useGetRooms(filters: RoomQuery, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();
  const enabled = options?.enabled !== undefined ? options.enabled : true;

  const sanitizedFilters = sanitizeRoomQuery(filters);
  
  const normalizedFilters = {
    hotelId: sanitizedFilters.hotelId?.toString() || undefined,
    minPrice: sanitizedFilters.minPrice?.toString() || undefined,
    maxPrice: sanitizedFilters.maxPrice?.toString() || undefined,
    roomType: sanitizedFilters.roomType || undefined,
    availableOnly: sanitizedFilters.availableOnly || undefined,
  };

  return useQuery<RoomView[]>({
    queryKey: ['rooms', normalizedFilters],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRooms(sanitizedFilters);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && enabled,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useUpdateHotelProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      location: string;
      address: string;
      mapLink: string;
      whatsapp: string | null;
      email: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.updateHotelProfile(
        params.name,
        params.location,
        params.address,
        params.mapLink,
        params.whatsapp,
        params.email
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useSetHotelActiveStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { hotelId: Principal; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.setHotelActiveStatus(params.hotelId, params.active);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
    },
  });
}

export function useSetHotelSubscriptionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { hotelId: Principal; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Map string to SubscriptionStatus enum
      const statusMap: Record<string, any> = {
        paid: { paid: null },
        unpaid: { unpaid: null },
        test: { test: null },
      };
      return await actor.setHotelSubscriptionStatus(params.hotelId, statusMap[params.status] || { test: null });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
    },
  });
}

export function useActivateHotelOwner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotelPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.activateHotelDirectly(hotelPrincipal);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
      await queryClient.invalidateQueries({ queryKey: ['isCallerHotelActivated'] });
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
    },
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      roomNumber: string;
      roomType: string;
      pricePerNight: bigint;
      currency: string;
      pictures: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createRoom(
        params.roomNumber,
        params.roomType,
        params.pricePerNight,
        params.currency,
        params.pictures
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}

export function useUpdateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      roomId: bigint;
      roomNumber: string;
      roomType: string;
      pricePerNight: bigint;
      currency: string;
      pictures: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.updateRoom(
        params.roomId,
        params.roomNumber,
        params.roomType,
        params.pricePerNight,
        params.currency,
        params.pictures
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}

// ============ BOOKING HOOKS ============

// Sanitize BookingQuery to convert null to undefined for backend compatibility
function sanitizeBookingQuery(filters: BookingQuery): BookingQuery {
  const sanitized: BookingQuery = {};
  
  if (filters.hotelId !== null && filters.hotelId !== undefined) {
    sanitized.hotelId = filters.hotelId;
  }
  
  if (filters.status !== null && filters.status !== undefined) {
    sanitized.status = filters.status;
  }
  
  if (filters.fromDate !== null && filters.fromDate !== undefined) {
    sanitized.fromDate = filters.fromDate;
  }
  
  if (filters.toDate !== null && filters.toDate !== undefined) {
    sanitized.toDate = filters.toDate;
  }
  
  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    sanitized.minPrice = filters.minPrice;
  }
  
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    sanitized.maxPrice = filters.maxPrice;
  }
  
  return sanitized;
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      hotelId: Principal;
      roomId: bigint;
      checkIn: bigint;
      checkOut: bigint;
      guests: bigint;
      roomsCount: bigint;
      currency: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createBooking(
        params.hotelId,
        params.roomId,
        params.checkIn,
        params.checkOut,
        params.guests,
        params.roomsCount,
        params.currency
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useGetBookings(filters?: BookingQuery) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const sanitizedFilters = filters ? sanitizeBookingQuery(filters) : {};

  const normalizedFilters = {
    hotelId: sanitizedFilters.hotelId?.toString() || undefined,
    status: sanitizedFilters.status || undefined,
    fromDate: sanitizedFilters.fromDate?.toString() || undefined,
    toDate: sanitizedFilters.toDate?.toString() || undefined,
    minPrice: sanitizedFilters.minPrice?.toString() || undefined,
    maxPrice: sanitizedFilters.maxPrice?.toString() || undefined,
  };

  return useQuery<BookingRequest[]>({
    queryKey: ['bookings', normalizedFilters],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.getBookings(sanitizedFilters);
        return result.bookings || [];
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; newStatus: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.updateBookingStatus(params.bookingId, params.newStatus);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.cancelBooking(bookingId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// ============ PAYMENT METHOD HOOKS ============

export function useAddPaymentMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; details: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Check if method exists
      if (typeof (actor as any).addPaymentMethod !== 'function') {
        throw new Error('Payment method management not yet available in backend');
      }
      return await (actor as any).addPaymentMethod(params.name, params.details);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}

export function useRemovePaymentMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // Check if method exists
      if (typeof (actor as any).removePaymentMethod !== 'function') {
        throw new Error('Payment method management not yet available in backend');
      }
      return await (actor as any).removePaymentMethod(index);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}
