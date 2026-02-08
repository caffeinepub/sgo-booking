import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type BookingStatus = {
    #pendingTransfer;
    #paymentFailed;
    #booked;
    #checkedIn;
    #canceled;
  };

  type PaymentMethod = {
    name : Text;
    details : Text;
  };

  type HotelContact = {
    whatsapp : ?Text;
    email : ?Text;
  };

  type SubscriptionStatus = {
    #paid;
    #unpaid;
    #test;
  };

  type HotelData = {
    id : Principal;
    name : Text;
    location : Text;
    rooms : List.List<Nat>;
    address : Text;
    mapLink : Text;
    active : Bool;
    bookings : List.List<Nat>;
    paymentMethods : List.List<PaymentMethod>;
    contact : HotelContact;
    subscriptionStatus : SubscriptionStatus;
  };

  type Room = {
    id : Nat;
    hotelId : Principal;
    roomNumber : Text;
    roomType : Text;
    pricePerNight : Nat;
    currency : Text;
    pictures : [Text];
  };

  type BookingRequest = {
    id : Nat;
    status : BookingStatus;
    hotelId : ?Principal;
    roomId : Nat;
    userId : Principal;
    checkIn : Int;
    checkOut : Int;
    totalPrice : Nat;
    guests : Nat;
    timestamp : Int;
    paymentProof : ?Text;
    currency : Text;
  };

  type InviteToken = {
    token : Text;
    isActive : Bool;
    issuedBy : Principal;
    issuedAt : Time.Time;
    maxUses : Nat;
    usageCount : Nat;
    boundPrincipal : ?Principal;
  };

  type Payment = {
    paymentId : Nat;
    bookingId : Nat;
    amount : Float;
    billNumber : Text;
    currency : Text;
    paymentProof : ?Text;
    confirmed : Bool;
    timestamp : Int;
  };

  type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  type OldActor = {
    hotelsMap : Map.Map<Principal, HotelData>;
    bookingsMap : Map.Map<Nat, BookingRequest>;
    roomsMap : Map.Map<Nat, Room>;
    userProfiles : Map.Map<Principal, UserProfile>;
    inviteTokens : Map.Map<Text, InviteToken>;
    payments : Map.Map<Nat, Payment>;
    directHotelActivations : Map.Map<Principal, Bool>;
  };

  type NewActor = {
    hotelsMap : Map.Map<Principal, HotelData>;
    bookingsMap : Map.Map<Nat, BookingRequest>;
    roomsMap : Map.Map<Nat, Room>;
    userProfiles : Map.Map<Principal, UserProfile>;
    inviteTokens : Map.Map<Text, InviteToken>;
    payments : Map.Map<Nat, Payment>;
    directHotelActivations : Map.Map<Principal, Bool>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
