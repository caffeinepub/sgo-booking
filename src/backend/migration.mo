import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Float "mo:core/Float";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

module {
  public type BookingStatus = {
    #pendingTransfer;
    #paymentFailed;
    #booked;
    #checkedIn;
    #canceled;
  };

  public type PaymentMethod = {
    name : Text;
    details : Text;
  };

  public type HotelContact = {
    whatsapp : ?Text;
    email : ?Text;
  };

  public type SubscriptionStatus = {
    #paid;
    #unpaid;
    #test;
  };

  public type HotelDataView = {
    id : Principal;
    name : Text;
    location : Text;
    address : Text;
    mapLink : Text;
    active : Bool;
    rooms : [Nat];
    bookings : [Nat];
    paymentMethods : [PaymentMethod];
    contact : HotelContact;
    subscriptionStatus : SubscriptionStatus;
  };

  public type HotelData = {
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

  public type Room = {
    id : Nat;
    hotelId : Principal;
    roomNumber : Text;
    roomType : Text;
    pricePerNight : Nat;
    currency : Text;
    pictures : [Text];
  };

  public type BookingRequest = {
    id : Nat;
    hotelId : ?Principal;
    roomId : Nat;
    userId : Principal;
    checkIn : Int;
    checkOut : Int;
    totalPrice : Nat;
    status : BookingStatus;
    guests : Nat;
    timestamp : Int;
    paymentProof : ?Text;
    currency : Text;
  };

  public type BookingQueryResult = {
    bookings : [BookingRequest];
    totalCount : Nat;
  };

  public type InviteToken = {
    token : Text;
    isActive : Bool;
    issuedBy : Principal;
    issuedAt : Time.Time;
    maxUses : Nat;
    usageCount : Nat;
    boundPrincipal : ?Principal;
  };

  public type Payment = {
    paymentId : Nat;
    bookingId : Nat;
    amount : Float;
    billNumber : Text;
    currency : Text;
    paymentProof : ?Text;
    confirmed : Bool;
    timestamp : Int;
  };

  public type BookingQuery = {
    hotelId : ?Principal;
    status : ?BookingStatus;
    fromDate : ?Int;
    toDate : ?Int;
    minPrice : ?Nat;
    maxPrice : ?Nat;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  public type RoomQuery = {
    hotelId : ?Principal;
    minPrice : ?Nat;
    maxPrice : ?Nat;
    roomType : ?Text;
    availableOnly : ?Bool;
  };

  public type OldHotelData = {
    id : Principal;
    name : Text;
    location : Text;
    address : Text;
    mapLink : Text;
    active : Bool;
    rooms : List.List<Nat>;
    bookings : List.List<Nat>;
    paymentMethods : List.List<PaymentMethod>;
  };

  public type OldActor = {
    roomsMap : Map.Map<Nat, Room>;
    bookingsMap : Map.Map<Nat, BookingRequest>;
    userProfiles : Map.Map<Principal, UserProfile>;
    hotelsMap : Map.Map<Principal, OldHotelData>;
    inviteTokens : Map.Map<Text, InviteToken>;
    payments : Map.Map<Nat, Payment>;
    directHotelActivations : Map.Map<Principal, Bool>;
    accessControlState : AccessControl.AccessControlState;
    inviteState : InviteLinksModule.InviteLinksSystemState;
  };

  public type NewActor = {
    roomsMap : Map.Map<Nat, Room>;
    bookingsMap : Map.Map<Nat, BookingRequest>;
    userProfiles : Map.Map<Principal, UserProfile>;
    hotelsMap : Map.Map<Principal, HotelData>;
    inviteTokens : Map.Map<Text, InviteToken>;
    payments : Map.Map<Nat, Payment>;
    directHotelActivations : Map.Map<Principal, Bool>;
    accessControlState : AccessControl.AccessControlState;
    inviteState : InviteLinksModule.InviteLinksSystemState;
  };

  public func run(old : OldActor) : NewActor {
    let newHotelsMap = old.hotelsMap.map<Principal, OldHotelData, HotelData>(
      func(_id, oldHotel) {
        {
          oldHotel with
          contact = {
            whatsapp = null;
            email = null;
          };
          subscriptionStatus = #unpaid;
        };
      }
    );
    {
      old with
      hotelsMap = newHotelsMap;
    };
  };
};

