// Extended types that should be in backend.d.ts but are missing
// These match the Motoko backend types defined in backend/main.mo

import { Principal } from '@icp-sdk/core/principal';

export enum BookingStatus {
  pendingTransfer = 'pendingTransfer',
  paymentFailed = 'paymentFailed',
  booked = 'booked',
  checkedIn = 'checkedIn',
  canceled = 'canceled',
}

export interface PaymentMethod {
  name: string;
  details: string;
}

export interface HotelContact {
  whatsapp: string | null;
  email: string | null;
}

export enum SubscriptionStatus {
  paid = 'paid',
  unpaid = 'unpaid',
  test = 'test',
}

export interface HotelDataView {
  id: Principal;
  name: string;
  location: string;
  address: string;
  mapLink: string;
  active: boolean;
  rooms: RoomView[];
  bookings: bigint[];
  paymentMethods: PaymentMethod[];
  contact: HotelContact;
  subscriptionStatus: SubscriptionStatus;
}

export interface RoomView {
  id: bigint;
  hotelId: Principal;
  roomNumber: string;
  roomType: string;
  pricePerNight: bigint;
  currency: string;
  pictures: string[];
}

export interface BookingRequest {
  id: bigint;
  status: BookingStatus;
  hotelId: Principal | null;
  roomId: bigint;
  userId: Principal;
  checkIn: bigint;
  checkOut: bigint;
  totalPrice: bigint;
  guests: bigint;
  timestamp: bigint;
  paymentProof: string | null;
  currency: string;
}

export interface BookingQueryResult {
  bookings: BookingRequest[];
  totalCount: bigint;
}

export interface InviteToken {
  token: string;
  isActive: boolean;
  issuedBy: Principal;
  issuedAt: bigint;
  maxUses: bigint;
  usageCount: bigint;
  boundPrincipal: Principal | null;
}

export interface BookingQuery {
  hotelId?: Principal | null;
  status?: BookingStatus | null;
  fromDate?: bigint | null;
  toDate?: bigint | null;
  minPrice?: bigint | null;
  maxPrice?: bigint | null;
}

export interface UserProfile {
  name: string;
  email: string | null;
  phone: string | null;
}

export interface RoomQuery {
  hotelId?: Principal | null;
  minPrice?: bigint | null;
  maxPrice?: bigint | null;
  roomType?: string | null;
  availableOnly?: boolean | null;
}

// Extended backend interface with all methods
export interface ExtendedBackendInterface {
  // Auth & Profile
  getCallerUserProfile(): Promise<UserProfile | null>;
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
  makeMeAdmin(): Promise<void>;
  
  // Invite tokens
  validateInviteToken(token: string): Promise<boolean>;
  consumeInviteToken(token: string): Promise<void>;
  createInviteToken(maxUses: bigint, boundPrincipal: Principal | null): Promise<string>;
  getInviteTokens(): Promise<InviteToken[]>;
  
  // Hotels
  getHotels(): Promise<HotelDataView[]>;
  getCallerHotelProfile(): Promise<HotelDataView>;
  updateHotelProfile(
    name: string,
    location: string,
    address: string,
    mapLink: string,
    whatsapp: string | null,
    email: string | null
  ): Promise<void>;
  setHotelActiveStatus(hotelId: Principal, active: boolean): Promise<void>;
  setHotelSubscriptionStatus(hotelId: Principal, status: SubscriptionStatus): Promise<void>;
  activateHotelOwner(hotelId: Principal): Promise<void>;
  
  // Payment methods
  addPaymentMethod(name: string, details: string): Promise<void>;
  removePaymentMethod(index: bigint): Promise<void>;
  
  // Rooms
  getRooms(filters: RoomQuery): Promise<RoomView[]>;
  createRoom(
    roomNumber: string,
    roomType: string,
    pricePerNight: bigint,
    currency: string,
    pictures: string[]
  ): Promise<bigint>;
  updateRoom(
    roomId: bigint,
    roomNumber: string,
    roomType: string,
    pricePerNight: bigint,
    currency: string,
    pictures: string[]
  ): Promise<void>;
  
  // Bookings
  getBookings(filters: BookingQuery): Promise<BookingQueryResult>;
  createBooking(
    hotelId: Principal,
    roomId: bigint,
    checkIn: bigint,
    checkOut: bigint,
    guests: bigint,
    currency: string
  ): Promise<bigint>;
  setPaymentProof(bookingId: bigint, paymentProof: string): Promise<void>;
  updateBookingStatus(bookingId: bigint, newStatus: BookingStatus): Promise<void>;
  recordStayCompletion(bookingId: bigint): Promise<void>;
}
