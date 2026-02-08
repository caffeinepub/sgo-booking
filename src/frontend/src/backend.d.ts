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
export interface InviteToken {
    boundPrincipal?: Principal;
    token: string;
    usageCount: bigint;
    isActive: boolean;
    issuedAt: Time;
    issuedBy: Principal;
    maxUses: bigint;
}
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
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
    activateHotelDirectly(hotelPrincipal: Principal): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    consumeInviteToken(token: string): Promise<boolean>;
    createInviteToken(maxUses: bigint, boundPrincipal: Principal | null): Promise<InviteToken>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getInviteTokens(): Promise<Array<InviteToken>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isHotelActiveByDirectActivation(_hotelPrincipal: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    validateInviteToken(token: string): Promise<boolean>;
}
