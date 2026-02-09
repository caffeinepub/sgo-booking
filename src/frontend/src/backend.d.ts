import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RoomQuery {
    hotelId?: Principal;
    maxPrice?: bigint;
    availableOnly?: boolean;
    minPrice?: bigint;
    roomType?: string;
}
export type Time = bigint;
export interface HotelContact {
    whatsapp?: string;
    email?: string;
}
export interface PaymentMethod {
    name: string;
    details: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface HotelDataView {
    id: Principal;
    active: boolean;
    contact: HotelContact;
    mapLink: string;
    bookings: Array<bigint>;
    name: string;
    subscriptionStatus: SubscriptionStatus;
    address: string;
    location: string;
    paymentMethods: Array<PaymentMethod>;
    rooms: Array<RoomView>;
}
export interface InviteToken {
    boundPrincipal?: Principal;
    token: string;
    usageCount: bigint;
    isActive: boolean;
    issuedAt: Time;
    issuedBy: Principal;
    maxUses: bigint;
}
export interface RoomView {
    id: bigint;
    pricePerNight: bigint;
    hotelId: Principal;
    roomNumber: string;
    currency: string;
    pictures: Array<string>;
    roomType: string;
}
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
}
export enum SubscriptionStatus {
    paid = "paid",
    test = "test",
    unpaid = "unpaid"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activateHotelDirectly(hotelPrincipal: Principal): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    consumeInviteToken(token: string): Promise<boolean>;
    createHotelInviteToken(_maxUses: bigint, boundPrincipal: Principal | null): Promise<InviteToken>;
    createHotelProfile(name: string, location: string, address: string, mapLink: string, whatsapp: string | null, email: string | null): Promise<void>;
    createRoom(roomNumber: string, roomType: string, pricePerNight: bigint, currency: string, pictures: Array<string>): Promise<RoomView>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerHotelProfile(): Promise<HotelDataView | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHotelProfile(hotelId: Principal): Promise<HotelDataView | null>;
    getHotels(): Promise<Array<HotelDataView>>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getInviteTokens(): Promise<Array<InviteToken>>;
    getRooms(filters: RoomQuery): Promise<Array<RoomView>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getValidHotelInviteTokens(): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerHotelActivated(): Promise<boolean>;
    isHotelActiveByDirectActivation(hotelPrincipal: Principal): Promise<boolean>;
    isHotelOwner(callerPrincipal: Principal, hotelId: Principal): Promise<boolean>;
    isValidHotelInviteToken(hotelPrincipal: Principal): Promise<boolean>;
    makeMeAdmin(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setHotelActiveStatus(hotelId: Principal, active: boolean): Promise<void>;
    setHotelSubscriptionStatus(hotelId: Principal, status: SubscriptionStatus): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updateHotelProfile(name: string, location: string, address: string, mapLink: string, whatsapp: string | null, email: string | null): Promise<void>;
    updateRoom(roomId: bigint, roomNumber: string, roomType: string, pricePerNight: bigint, currency: string, pictures: Array<string>): Promise<RoomView>;
    validateInviteToken(token: string): Promise<boolean>;
}
