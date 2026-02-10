import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type OldBookingStatus = {
    #pendingTransfer;
    #paymentFailed;
    #booked;
    #checkedIn;
    #canceled;
  };

  type OldPaymentMethod = {
    name : Text;
    details : Text;
  };

  type OldHotelContact = {
    whatsapp : ?Text;
    email : ?Text;
  };

  type OldSubscriptionStatus = {
    #paid;
    #unpaid;
    #test;
  };

  type OldHotelData = {
    id : Principal;
    name : Text;
    location : Text;
    address : Text;
    mapLink : Text;
    active : Bool;
    rooms : List.List<Nat>;
    bookings : List.List<Nat>;
    paymentMethods : List.List<OldPaymentMethod>;
    contact : OldHotelContact;
    subscriptionStatus : OldSubscriptionStatus;
  };

  type OldRoom = {
    id : Nat;
    hotelId : Principal;
    roomNumber : Text;
    roomType : Text;
    pricePerNight : Nat;
    currency : Text;
    pictures : [Text];
  };

  type OldBookingRequest = {
    id : Nat;
    status : OldBookingStatus;
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
    roomsCount : Nat;
  };

  type OldInviteToken = {
    token : Text;
    isActive : Bool;
    issuedBy : Principal;
    issuedAt : Time.Time;
    maxUses : Nat;
    usageCount : Nat;
    boundPrincipal : ?Principal;
  };

  type OldPayment = {
    paymentId : Nat;
    bookingId : Nat;
    amount : Float;
    billNumber : Text;
    currency : Text;
    paymentProof : ?Text;
    confirmed : Bool;
    timestamp : Int;
  };

  type OldUserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  type OldActor = {
    nextBookingId : Nat;
    hasRunUpgradeCleanup : Bool;
    nextRoomId : Nat;
    hotelsList : List.List<OldHotelData>;
    roomsMap : Map.Map<Nat, OldRoom>;
    bookingsMap : Map.Map<Nat, OldBookingRequest>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    inviteTokens : Map.Map<Text, OldInviteToken>;
    payments : Map.Map<Nat, OldPayment>;
    directHotelActivations : Map.Map<Principal, Bool>;
    hotelOwners : Map.Map<Principal, Principal>;
    legacyActiveHotels : List.List<Principal>;
    legacyDeactivatedHotels : List.List<Principal>;
  };

  type NewBookingStatus = {
    #pendingTransfer;
    #paymentFailed;
    #booked;
    #checkedIn;
    #canceled;
  };

  type NewPaymentMethod = {
    name : Text;
    details : Text;
  };

  type NewHotelContact = {
    whatsapp : ?Text;
    email : ?Text;
  };

  type NewSubscriptionStatus = {
    #paid;
    #unpaid;
    #test;
  };

  type NewHotelData = {
    id : Principal;
    name : Text;
    location : Text;
    address : Text;
    mapLink : Text;
    active : Bool;
    rooms : List.List<Nat>;
    bookings : List.List<Nat>;
    paymentMethods : List.List<NewPaymentMethod>;
    contact : NewHotelContact;
    subscriptionStatus : NewSubscriptionStatus;
  };

  type NewRoom = {
    id : Nat;
    hotelId : Principal;
    roomType : Text;
    pricePerNight : Nat;
    promoPercent : Nat;
    discountedPrice : Nat;
    currency : Text;
    pictures : [Text];
  };

  type NewBookingRequest = {
    id : Nat;
    status : NewBookingStatus;
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
    roomsCount : Nat;
  };

  type NewInviteToken = {
    token : Text;
    isActive : Bool;
    issuedBy : Principal;
    issuedAt : Time.Time;
    maxUses : Nat;
    usageCount : Nat;
    boundPrincipal : ?Principal;
  };

  type NewPayment = {
    paymentId : Nat;
    bookingId : Nat;
    amount : Float;
    billNumber : Text;
    currency : Text;
    paymentProof : ?Text;
    confirmed : Bool;
    timestamp : Int;
  };

  type NewUserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  type NewActor = {
    nextBookingId : Nat;
    hasRunUpgradeCleanup : Bool;
    nextRoomId : Nat;
    hotelsList : List.List<NewHotelData>;
    roomsMap : Map.Map<Nat, NewRoom>;
    bookingsMap : Map.Map<Nat, NewBookingRequest>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    inviteTokens : Map.Map<Text, NewInviteToken>;
    payments : Map.Map<Nat, NewPayment>;
    directHotelActivations : Map.Map<Principal, Bool>;
    hotelOwners : Map.Map<Principal, Principal>;
    legacyActiveHotels : List.List<Principal>;
    legacyDeactivatedHotels : List.List<Principal>;
  };

  public func run(old : OldActor) : NewActor {
    let newRoomsMap = old.roomsMap.map<Nat, OldRoom, NewRoom>(
      func(_id, oldRoom) {
        {
          id = oldRoom.id;
          hotelId = oldRoom.hotelId;
          roomType = oldRoom.roomType;
          pricePerNight = oldRoom.pricePerNight;
          promoPercent = 0; // default no promo on upgrade
          discountedPrice = oldRoom.pricePerNight; // initially same as pricePerNight
          currency = oldRoom.currency;
          pictures = oldRoom.pictures;
        };
      }
    );
    {
      old with roomsMap = newRoomsMap;
    };
  };
};

