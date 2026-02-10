import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export type Time = bigint;
export interface RoomInput {
    pricePerNight: bigint;
    promoPercent: bigint;
    currency: string;
    pictures: Array<string>;
    roomType: string;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createRoom(input: RoomInput): Promise<RoomView>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    makeMeAdmin(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updateRoom(roomId: bigint, input: RoomInput): Promise<RoomView>;
}
