import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { backendInterface, UserRole, RoomInput, UserProfile as BackendUserProfile } from '../backend';
import type { HotelDataView, RoomView, BookingRequest, BookingQueryResult, UserProfile, InviteToken } from '../types/extended-backend';
import { Principal } from '@icp-sdk/core/principal';
import { useInternetIdentity } from './useInternetIdentity';

// Helper to safely check if a method exists on the actor
function hasMethod(actor: any, methodName: string): boolean {
  return actor && typeof actor[methodName] === 'function';
}

// Helper to convert backend UserProfile to extended UserProfile
function toExtendedUserProfile(profile: BackendUserProfile | null): UserProfile | null {
  if (!profile) return null;
  return {
    name: profile.name,
    email: profile.email ?? null,
    phone: profile.phone ?? null,
  };
}

// Helper to convert extended UserProfile to backend UserProfile
function toBackendUserProfile(profile: UserProfile): BackendUserProfile {
  return {
    name: profile.name,
    email: profile.email ?? undefined,
    phone: profile.phone ?? undefined,
  };
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<UserRole>({
    queryKey: ['callerUserRole', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!hasMethod(actor, 'getCallerUserRole')) {
        throw new Error('Method getCallerUserRole not available');
      }
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
      if (!hasMethod(actor, 'isCallerAdmin')) {
        throw new Error('Method isCallerAdmin not available');
      }
      return await actor.isCallerAdmin();
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
      if (!hasMethod(actor, 'getCallerUserProfile')) {
        return null;
      }
      const backendProfile = await actor.getCallerUserProfile();
      return toExtendedUserProfile(backendProfile);
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
      if (!hasMethod(actor, 'saveCallerUserProfile')) {
        throw new Error('Profile save not available');
      }
      const backendProfile = toBackendUserProfile(profile);
      return await actor.saveCallerUserProfile(backendProfile);
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
      if (!hasMethod(actor, 'makeMeAdmin')) {
        throw new Error('Admin elevation not available');
      }
      return await actor.makeMeAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCurrentUserAdmin'] });
    },
  });
}

// Compatibility layer for invite tokens - maps to invite codes
export function useValidateInviteToken() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      // For now, return true if token is non-empty (basic validation)
      // Backend will validate on consumption
      return token.trim().length > 0;
    },
  });
}

export function useConsumeInviteToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have consumeInviteToken, so we throw a clear error
      throw new Error('Hotel activation is currently unavailable. Please contact an administrator.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCurrentUserAdmin'] });
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
      if (!hasMethod(actor, 'generateInviteCode')) {
        throw new Error('Invite code generation not available');
      }
      // generateInviteCode returns a string code
      return await actor.generateInviteCode();
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
      if (!hasMethod(actor, 'getInviteCodes')) {
        return [];
      }
      // Map InviteCode[] to InviteToken[] format
      const codes = await actor.getInviteCodes();
      return codes.map((code: any) => ({
        token: code.code,
        isActive: !code.used,
        issuedBy: identity?.getPrincipal() || Principal.anonymous(),
        issuedAt: code.created,
        maxUses: BigInt(1),
        usageCount: code.used ? BigInt(1) : BigInt(0),
        boundPrincipal: null,
      }));
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: 1,
  });
}

// Hotel profile stub - returns null since backend doesn't have this yet
export function useGetCallerHotelProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<HotelDataView | null>({
    queryKey: ['callerHotelProfile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have getCallerHotelProfile yet
      // Return null to indicate no hotel profile
      return null;
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
      throw new Error('Hotel profile update is currently unavailable');
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
      if (!hasMethod(actor, 'createRoom')) {
        throw new Error('Room creation not available');
      }
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
      if (!hasMethod(actor, 'updateRoom')) {
        throw new Error('Room update not available');
      }
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
      throw new Error('Room deletion is currently unavailable');
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
      // Backend doesn't have getRooms yet
      return [];
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

// Stub implementations for booking-related hooks
export function useGetHotels() {
  const { actor, isFetching } = useActor();

  return useQuery<HotelDataView[]>({
    queryKey: ['hotels'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return [];
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}

export function useAdminGetAllHotels() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<HotelDataView[]>({
    queryKey: ['adminHotels'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return [];
    },
    enabled: !!actor && !isFetching && !!identity,
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
      throw new Error('Booking creation is currently unavailable');
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
      return { bookings: [], totalCount: BigInt(0) };
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
      return { bookings: [], totalCount: BigInt(0) };
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
      return { bookings: [], totalCount: BigInt(0) };
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
      throw new Error('Booking cancellation is currently unavailable');
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
      throw new Error('Booking confirmation is currently unavailable');
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
      throw new Error('Payment method management is currently unavailable');
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
      throw new Error('Payment method management is currently unavailable');
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
      throw new Error('Hotel activation management is currently unavailable');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
    },
  });
}

export function useAdminUpdateHotelSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { hotelId: Principal; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      throw new Error('Subscription management is currently unavailable');
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
      throw new Error('Principal purge is currently unavailable');
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
      throw new Error('Legacy data cleanup is currently unavailable');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
