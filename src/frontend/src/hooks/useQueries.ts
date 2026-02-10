import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { backendInterface, UserRole, RoomInput } from '../backend';
import type { HotelDataView, RoomView, BookingRequest, BookingQueryResult, UserProfile, InviteToken } from '../types/extended-backend';
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
      return await (actor as any).isCallerHotelActivated();
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
      return await (actor as any).getCallerUserProfile();
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
      return await (actor as any).saveCallerUserProfile(profile);
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
      return await (actor as any).validateInviteToken(token);
    },
  });
}

export function useConsumeInviteToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).consumeInviteToken(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCurrentUserAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerHotelActivated'] });
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
    },
  });
}

export function useCreateInviteToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { maxUses: bigint; boundPrincipal: Principal | null }) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).createHotelInviteToken(params.maxUses, params.boundPrincipal);
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
      return await (actor as any).getInviteTokens();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: 1,
  });
}

// Public hotel listing for guests (only active hotels with paid/test subscriptions)
export function useGetHotels() {
  const { actor, isFetching } = useActor();

  return useQuery<HotelDataView[]>({
    queryKey: ['hotels'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).getHotels();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}

// Admin-only hotel listing (all hotels including inactive/unpaid)
export function useAdminGetAllHotels() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<HotelDataView[]>({
    queryKey: ['adminHotels'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).adminGetAllHotels();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: 1,
  });
}

export function useGetCallerHotelProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<HotelDataView | null>({
    queryKey: ['callerHotelProfile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).getCallerHotelProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
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
      email: string | null;
      whatsapp: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).updateHotelProfile(
        params.name,
        params.location,
        params.address,
        params.mapLink,
        params.email,
        params.whatsapp
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
    },
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RoomInput) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createRoom(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { roomId: bigint; input: RoomInput }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.updateRoom(params.roomId, params.input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useDeleteRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).deleteRoom(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useGetRooms() {
  const { actor, isFetching } = useActor();

  return useQuery<RoomView[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).getRooms();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
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
      roomsCount: bigint;
      currency: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).createBooking(
        params.hotelId,
        params.roomId,
        params.checkIn,
        params.checkOut,
        params.guests,
        params.roomsCount,
        params.currency
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['callerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['hotelBookings'] });
    },
  });
}

export function useGetCallerBookings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<BookingQueryResult>({
    queryKey: ['callerBookings', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).getCallerBookings();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: 1,
  });
}

export function useGetHotelBookings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<BookingQueryResult>({
    queryKey: ['hotelBookings', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).getHotelBookings();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: 1,
  });
}

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<BookingQueryResult>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).getAllBookings();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: 1,
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).cancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['callerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['hotelBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useConfirmBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).confirmBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['callerBookings'] });
      queryClient.invalidateQueries({ queryKey: ['hotelBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useAddPaymentMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; details: string }) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).addPaymentMethod(params.name, params.details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
    },
  });
}

export function useRemovePaymentMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (methodName: string) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).removePaymentMethod(methodName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
    },
  });
}

export function useAdminToggleHotelActivation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { hotelId: Principal; activate: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).adminToggleHotelActivation(params.hotelId, params.activate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerHotelActivated'] });
    },
  });
}

export function useAdminUpdateHotelSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { hotelId: Principal; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).adminUpdateHotelSubscription(params.hotelId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
    },
  });
}

export function useAdminPurgePrincipalData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).adminPurgePrincipalData(principalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useAdminCleanupLegacyData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).adminCleanupLegacyData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
