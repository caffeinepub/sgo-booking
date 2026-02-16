import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface RoomInput {
    pricePerNight: bigint;
    promoPercent: bigint;
    currency: string;
    pictures: Array<string>;
    roomType: string;
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
export interface RoomView {
    id: bigint;
    pricePerNight: bigint;
    hotelId: Principal;
    promoPercent: bigint;
    currency: string;
    pictures: Array<string>;
    roomType: string;
    discountedPrice: bigint;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createRoom(input: RoomInput): Promise<RoomView>;
    generateInviteCode(): Promise<string>;
    getAllHotels(): Promise<Array<{
        data: HotelDataView;
        hotelId: Principal;
    }>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerHotelProfile(): Promise<HotelDataView | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    makeMeAdmin(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    toggleHotelActiveStatus(hotelId: Principal): Promise<boolean>;
    updateRoom(roomId: bigint, input: RoomInput): Promise<RoomView>;
    updateSubscriptionStatus(hotelId: Principal, status: SubscriptionStatus): Promise<void>;
}
