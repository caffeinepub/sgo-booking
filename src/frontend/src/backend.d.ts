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
export interface BookingRequest {
    id: bigint;
    status: BookingStatus;
    checkIn: bigint;
    userId: Principal;
    hotelId?: Principal;
    paymentProof?: string;
    currency: string;
    timestamp: bigint;
    checkOut: bigint;
    roomId: bigint;
    totalPrice: bigint;
    guests: bigint;
}
export interface BookingQueryResult {
    bookings: Array<BookingRequest>;
    totalCount: bigint;
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
export interface BookingQuery {
    status?: BookingStatus;
    hotelId?: Principal;
    maxPrice?: bigint;
    toDate?: bigint;
    fromDate?: bigint;
    minPrice?: bigint;
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
export enum BookingStatus {
    canceled = "canceled",
    booked = "booked",
    checkedIn = "checkedIn",
    pendingTransfer = "pendingTransfer",
    paymentFailed = "paymentFailed"
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
    activateHotelOwner(hotelId: Principal): Promise<void>;
    addPaymentMethod(name: string, details: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    consumeInviteToken(token: string): Promise<void>;
    createBooking(hotelId: Principal, roomId: bigint, checkIn: bigint, checkOut: bigint, guests: bigint, _currency: string): Promise<bigint>;
    createInviteToken(maxUses: bigint, boundPrincipal: Principal | null): Promise<string>;
    createMockBooking(hotelId: Principal | null, roomId: bigint, checkIn: bigint, checkOut: bigint, guests: bigint, totalPrice: bigint, currency: string): Promise<void>;
    createRoom(roomNumber: string, roomType: string, pricePerNight: bigint, currency: string, pictures: Array<string>): Promise<bigint>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getBookings(filters: BookingQuery): Promise<BookingQueryResult>;
    getCallerHotelProfile(): Promise<HotelDataView | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHotels(): Promise<Array<HotelDataView>>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getInviteTokens(): Promise<Array<InviteToken>>;
    getRoom(roomId: bigint): Promise<RoomView | null>;
    getRooms(filters: RoomQuery): Promise<Array<RoomView>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    makeMeAdmin(): Promise<void>;
    recordStayCompletion(bookingId: bigint): Promise<void>;
    removePaymentMethod(index: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setHotelActiveStatus(hotelId: Principal, active: boolean): Promise<void>;
    setHotelSubscriptionStatus(hotelId: Principal, status: SubscriptionStatus): Promise<void>;
    setPaymentProof(bookingId: bigint, paymentProof: string): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updateBookingStatus(bookingId: bigint, newStatus: BookingStatus): Promise<void>;
    updateHotelProfile(name: string, location: string, address: string, mapLink: string, whatsapp: string | null, email: string | null): Promise<void>;
    updateRoom(roomId: bigint, roomNumber: string, roomType: string, pricePerNight: bigint, currency: string, pictures: Array<string>): Promise<void>;
    validateInviteToken(token: string): Promise<boolean>;
}
