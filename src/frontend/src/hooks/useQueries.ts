import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { backendInterface, RoomInput, UserProfile as BackendUserProfile, SubscriptionStatus, HotelDataView as BackendHotelDataView } from '../backend';
import { UserRole } from '../backend';
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

// Helper to convert backend HotelDataView to extended HotelDataView
function toExtendedHotelDataView(hotel: BackendHotelDataView): HotelDataView {
  return {
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    address: hotel.address,
    mapLink: hotel.mapLink,
    active: hotel.active,
    rooms: hotel.rooms,
    bookings: hotel.bookings,
    paymentMethods: hotel.paymentMethods,
    contact: {
      whatsapp: hotel.contact.whatsapp ?? null,
      email: hotel.contact.email ?? null,
    },
    subscriptionStatus: hotel.subscriptionStatus,
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

// V44 behavior: Use backend invite code system
export function useValidateInviteToken() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error('Actor not available');
      // Basic validation - token must be non-empty
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
      if (!hasMethod(actor, 'submitRSVP')) {
        throw new Error('Hotel activation not available');
      }
      // V44: Use submitRSVP with the invite code to activate hotel
      await actor.submitRSVP('Hotel Activation', true, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCurrentUserAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerHotelActivated'] });
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
      // V44: generateInviteCode returns a string code
      const code = await actor.generateInviteCode();
      return code;
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
      // V44: Map InviteCode[] to InviteToken[] format
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

// V44: Check hotel activation via role system
export function useIsCallerHotelActivated() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<boolean>({
    queryKey: ['isCallerHotelActivated', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!hasMethod(actor, 'getCallerUserRole')) {
        return false;
      }
      // V44: Hotel is activated if user has 'user' role (not guest)
      const role = await actor.getCallerUserRole();
      return role === UserRole.user || role === UserRole.admin;
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
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
      if (!hasMethod(actor, 'getCallerHotelProfile')) {
        return null;
      }
      const profile = await actor.getCallerHotelProfile();
      if (!profile) return null;
      return toExtendedHotelDataView(profile);
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
      if (!hasMethod(actor, 'getAllHotels')) {
        return [];
      }
      const result = await actor.getAllHotels();
      return result.map((item: { hotelId: Principal; data: BackendHotelDataView }) => 
        toExtendedHotelDataView(item.data)
      );
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
      if (!hasMethod(actor, 'toggleHotelActiveStatus')) {
        throw new Error('Hotel activation management not available');
      }
      const newStatus = await actor.toggleHotelActiveStatus(params.hotelId);
      return newStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
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
      if (!hasMethod(actor, 'updateSubscriptionStatus')) {
        throw new Error('Subscription management not available');
      }
      // Convert string to SubscriptionStatus enum
      let subscriptionStatus: SubscriptionStatus;
      if (params.status === 'paid') {
        subscriptionStatus = 'paid' as SubscriptionStatus;
      } else if (params.status === 'unpaid') {
        subscriptionStatus = 'unpaid' as SubscriptionStatus;
      } else {
        subscriptionStatus = 'test' as SubscriptionStatus;
      }
      await actor.updateSubscriptionStatus(params.hotelId, subscriptionStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
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
      throw new Error('Principal data purge is currently unavailable');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}
