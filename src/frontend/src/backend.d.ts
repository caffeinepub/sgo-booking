import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
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
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    isCallerAdmin(): Promise<boolean>;
    makeMeAdmin(): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updateRoom(roomId: bigint, input: RoomInput): Promise<RoomView>;
}
