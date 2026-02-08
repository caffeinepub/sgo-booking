import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole, BookingQuery, RoomQuery, UserProfile, BookingStatus, SubscriptionStatus } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 1,
  });
}

export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCurrentUserAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    retry: 1,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
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
      return actor.saveCallerUserProfile(profile);
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
      return actor.makeMeAdmin();
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
      return actor.validateInviteToken(token);
    },
  });
}

export function useConsumeInviteToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.consumeInviteToken(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isCurrentUserAdmin'] });
    },
  });
}

export function useGetHotels() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHotels();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10000,
    retry: 1,
  });
}

export function useGetCallerHotelProfile(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();
  const enabled = options?.enabled !== undefined ? options.enabled : true;

  return useQuery({
    queryKey: ['callerHotelProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerHotelProfile();
      } catch (error) {
        console.log('Hotel profile query rejected, treating as not activated:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && enabled,
    retry: false,
  });
}

export function useGetRooms(filters: RoomQuery, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();
  const enabled = options?.enabled !== undefined ? options.enabled : true;

  const normalizedFilters = {
    hotelId: filters.hotelId?.toString() || null,
    minPrice: filters.minPrice?.toString() || null,
    maxPrice: filters.maxPrice?.toString() || null,
    roomType: filters.roomType || null,
    availableOnly: filters.availableOnly || null,
  };

  return useQuery({
    queryKey: ['rooms', normalizedFilters],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRooms(filters);
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

export function useGetBookings(filters: BookingQuery) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      if (!actor) return { bookings: [], totalCount: BigInt(0) };
      return actor.getBookings(filters);
    },
    enabled: !!actor && !isFetching,
  });
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
      currency: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(
        params.hotelId,
        params.roomId,
        params.checkIn,
        params.checkOut,
        params.guests,
        params.currency
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useSetPaymentProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; paymentProof: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPaymentProof(params.bookingId, params.paymentProof);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; newStatus: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookingStatus(params.bookingId, params.newStatus);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useRecordStayCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordStayCompletion(bookingId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
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
      return actor.updateHotelProfile(
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
    },
  });
}

export function useAddPaymentMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; details: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPaymentMethod(params.name, params.details);
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
      return actor.removePaymentMethod(index);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
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
      return actor.createRoom(
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
      return actor.updateRoom(
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

export function useCreateInviteToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { maxUses: bigint; boundPrincipal: Principal | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInviteToken(params.maxUses, params.boundPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inviteTokens'] });
    },
  });
}

export function useGetInviteTokens() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['inviteTokens'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getInviteTokens();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetHotelActiveStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { hotelId: Principal; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setHotelActiveStatus(params.hotelId, params.active);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}

export function useSetHotelSubscriptionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { hotelId: Principal; status: SubscriptionStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setHotelSubscriptionStatus(params.hotelId, params.status);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}

export function useActivateHotelOwner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotelId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.activateHotelOwner(hotelId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
    },
  });
}

export function useGenerateInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateInviteCode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inviteCodes'] });
    },
  });
}

export function useGetInviteCodes() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['inviteCodes'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getInviteCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitRSVP() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { name: string; attending: boolean; inviteCode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitRSVP(params.name, params.attending, params.inviteCode);
    },
  });
}

export function useGetAllRSVPs() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['rsvps'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllRSVPs();
    },
    enabled: !!actor && !isFetching,
  });
}
