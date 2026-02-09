import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { backendInterface, UserRole, UserProfile, InviteToken, HotelDataView, RoomView, RoomQuery } from '../backend';
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

  return useQuery<RoomView[]>({
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
    mutationFn: async (hotelId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.activateHotelDirectly(hotelId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hotels'] });
      await queryClient.invalidateQueries({ queryKey: ['callerHotelProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['isCallerHotelActivated'] });
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
