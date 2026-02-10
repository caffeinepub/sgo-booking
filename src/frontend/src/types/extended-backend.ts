// Extended TypeScript interface definitions matching actual backend types
import type { Principal } from '@icp-sdk/core/principal';
import type { Time } from '../backend';

export enum BookingStatus {
  pendingTransfer = 'pendingTransfer',
  paymentFailed = 'paymentFailed',
  booked = 'booked',
  checkedIn = 'checkedIn',
  canceled = 'canceled',
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
  roomsCount: bigint;
}

export interface BookingQueryResult {
  bookings: BookingRequest[];
  totalCount: bigint;
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
  roomType: string;
  pricePerNight: bigint;
  promoPercent: bigint;
  discountedPrice: bigint;
  currency: string;
  pictures: string[];
}

export interface RoomInput {
  roomType: string;
  pricePerNight: bigint;
  promoPercent: bigint;
  currency: string;
  pictures: string[];
}

export interface UserProfile {
  name: string;
  email: string | null;
  phone: string | null;
}

export interface InviteToken {
  token: string;
  isActive: boolean;
  issuedBy: Principal;
  issuedAt: Time;
  maxUses: bigint;
  usageCount: bigint;
  boundPrincipal: Principal | null;
}
