import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import InviteLinksModule "invite-links/invite-links-module";
import AccessControl "authorization/access-control";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Float "mo:core/Float";

module {
  let DEPRECATED_GOAT_HOTEL_ID_TEXT = "opo7v-ka45k-pk32j-76qsi-o3ngz-e6tgc-755di-t2vx3-t2ugj-qnpbc-gae";

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
    address : Text;
    mapLink : Text;
    active : Bool;
    rooms : List.List<Nat>;
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
    roomsCount : Nat;
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
    nextBookingId : Nat;
    hasRunUpgradeCleanup : Bool;
    hotelsList : List.List<HotelData>;
    roomsMap : Map.Map<Nat, Room>;
    bookingsMap : Map.Map<Nat, BookingRequest>;
    userProfiles : Map.Map<Principal, UserProfile>;
    inviteTokens : Map.Map<Text, InviteToken>;
    payments : Map.Map<Nat, Payment>;
    directHotelActivations : Map.Map<Principal, Bool>;
    hotelOwners : Map.Map<Principal, Principal>;
    nextRoomId : Nat;
    accessControlState : AccessControl.AccessControlState;
    inviteState : InviteLinksModule.InviteLinksSystemState;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    let filteredHotels = old.hotelsList.filter(
      func(hotel) { not (hotel.id.toText() == DEPRECATED_GOAT_HOTEL_ID_TEXT) }
    );

    let filteredRooms = old.roomsMap.filter(
      func(_id, room) { not (room.hotelId.toText() == DEPRECATED_GOAT_HOTEL_ID_TEXT) }
    );

    let filteredBookings = old.bookingsMap.filter(
      func(_id, booking) {
        switch (booking.hotelId) {
          case (?hotelId) { not (hotelId.toText() == DEPRECATED_GOAT_HOTEL_ID_TEXT) };
          case (null) { true };
        }
      }
    );

    let deprecatedBookingIds = old.bookingsMap.toArray().filter(
      func((_, booking)) {
        switch (booking.hotelId) {
          case (?hotelId) { hotelId.toText() == DEPRECATED_GOAT_HOTEL_ID_TEXT };
          case (null) { false };
        }
      }
    ).map(func((bookingId, _)) { bookingId });

    let filteredPayments = old.payments.filter(
      func(_paymentId, payment) {
        not deprecatedBookingIds.find(func(bookingId) { bookingId == payment.bookingId }).isSome()
      }
    );

    let filteredInviteTokens = old.inviteTokens.filter(
      func(_token, inviteToken) {
        switch (inviteToken.boundPrincipal) {
          case (?boundPrincipal) { not (boundPrincipal.toText() == DEPRECATED_GOAT_HOTEL_ID_TEXT) };
          case (null) { true };
        }
      }
    );

    let filteredActivations = old.directHotelActivations.filter(
      func(hotelId, _status) { not (hotelId.toText() == DEPRECATED_GOAT_HOTEL_ID_TEXT) }
    );

    let filteredOwners = old.hotelOwners.filter(
      func(hotelId, _owner) { not (hotelId.toText() == DEPRECATED_GOAT_HOTEL_ID_TEXT) }
    );

    {
      old with
      hotelsList = filteredHotels;
      roomsMap = filteredRooms;
      bookingsMap = filteredBookings;
      payments = filteredPayments;
      inviteTokens = filteredInviteTokens;
      directHotelActivations = filteredActivations;
      hotelOwners = filteredOwners;
    };
  };
};
