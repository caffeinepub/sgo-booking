import Nat "mo:core/Nat";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

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

  type HotelDataView = {
    id : Principal;
    name : Text;
    location : Text;
    address : Text;
    mapLink : Text;
    active : Bool;
    rooms : [RoomView];
    bookings : [Nat];
    paymentMethods : [PaymentMethod];
    contact : HotelContact;
    subscriptionStatus : SubscriptionStatus;
  };

  type HotelData = {
    id : Principal;
    name : Text;
    location : Text;
    address : Text;
    mapLink : Text;
    active : Bool;
    rooms : List.List<Nat>;
    bookings : List.List<Nat>;
    paymentMethods : List.List<PaymentMethod>;
    contact : HotelContact;
    subscriptionStatus : SubscriptionStatus;
  };

  type RoomView = {
    id : Nat;
    hotelId : Principal;
    roomNumber : Text;
    roomType : Text;
    pricePerNight : Nat;
    currency : Text;
    pictures : [Text];
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

  type RoomQuery = {
    hotelId : ?Principal;
    minPrice : ?Nat;
    maxPrice : ?Nat;
    roomType : ?Text;
    availableOnly : ?Bool;
  };

  type OldActor = {
    hotelsMap : Map.Map<Principal, HotelData>;
    roomsMap : Map.Map<Nat, Room>;
    bookingsMap : Map.Map<Nat, BookingRequest>;
    userProfiles : Map.Map<Principal, UserProfile>;
    inviteTokens : Map.Map<Text, InviteToken>;
    payments : Map.Map<Nat, Payment>;
    directHotelActivations : Map.Map<Principal, Bool>;
    nextRoomId : Nat;
    accessControlState : AccessControl.AccessControlState;
    inviteState : InviteLinksModule.InviteLinksSystemState;
  };

  type NewActor = {
    hotelsList : List.List<HotelData>;
    roomsMap : Map.Map<Nat, Room>;
    bookingsMap : Map.Map<Nat, BookingRequest>;
    userProfiles : Map.Map<Principal, UserProfile>;
    inviteTokens : Map.Map<Text, InviteToken>;
    payments : Map.Map<Nat, Payment>;
    directHotelActivations : Map.Map<Principal, Bool>;
    nextRoomId : Nat;
    accessControlState : AccessControl.AccessControlState;
    inviteState : InviteLinksModule.InviteLinksSystemState;
  };

  public func run(old : OldActor) : NewActor {
    let hotelsList = List.empty<HotelData>();
    old.hotelsMap.values().forEach(
      func(hotel) {
        hotelsList.add(hotel);
      }
    );

    {
      hotelsList;
      roomsMap = old.roomsMap;
      bookingsMap = old.bookingsMap;
      userProfiles = old.userProfiles;
      inviteTokens = old.inviteTokens;
      payments = old.payments;
      directHotelActivations = old.directHotelActivations;
      nextRoomId = old.nextRoomId;
      accessControlState = old.accessControlState;
      inviteState = old.inviteState;
    };
  };
};
