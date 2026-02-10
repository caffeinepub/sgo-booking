import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Migration "migration";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let HARDCODED_ADMIN : Principal = Principal.fromText("ayatf-afj3q-z5wvo-4ocoi-x7lve-uel5k-yhe6p-ahp57-ww5ch-bc72g-wae");
  let DEPRECATED_GOAT_HOTEL_ID_TEXT = "opo7v-ka45k-pk32j-76qsi-o3ngz-e6tgc-755di-t2vx3-t2ugj-qnpbc-gae";

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
    rooms : [RoomView];
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

  public type RoomView = {
    id : Nat;
    hotelId : Principal;
    roomType : Text;
    pricePerNight : Nat;
    promoPercent : Nat;
    discountedPrice : Nat;
    currency : Text;
    pictures : [Text];
  };

  public type Room = {
    id : Nat;
    hotelId : Principal;
    roomType : Text;
    pricePerNight : Nat;
    promoPercent : Nat;
    discountedPrice : Nat;
    currency : Text;
    pictures : [Text];
  };

  public type RoomInput = {
    roomType : Text;
    pricePerNight : Nat;
    promoPercent : Nat;
    currency : Text;
    pictures : [Text];
  };

  public type CancellableBookingResult = {
    #canceledByGuest;
    #canceledByHotel;
  };

  public type BookingRequest = {
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

  public type RoomUpdate = {
    #priceUpdate : Nat;
    #addRoom : RoomInput;
    #removeRoom : Nat;
  };

  var nextBookingId = 0;
  var hasRunUpgradeCleanup = false;

  let hotelsList = List.empty<HotelData>();
  let roomsMap = Map.empty<Nat, Room>();
  let bookingsMap = Map.empty<Nat, BookingRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let inviteTokens = Map.empty<Text, InviteToken>();
  let payments = Map.empty<Nat, Payment>();
  let directHotelActivations = Map.empty<Principal, Bool>();
  let hotelOwners = Map.empty<Principal, Principal>();
  var nextRoomId = 0;
  let accessControlState = AccessControl.initState();
  let inviteState = InviteLinksModule.initState();
  let legacyActiveHotels = List.empty<Principal>();
  let legacyDeactivatedHotels = List.empty<Principal>();

  include MixinAuthorization(accessControlState);

  private func isHardcodedAdmin(caller : Principal) : Bool {
    Principal.equal(caller, HARDCODED_ADMIN);
  };

  private func isAdminUser(caller : Principal) : Bool {
    isHardcodedAdmin(caller) or AccessControl.isAdmin(accessControlState, caller);
  };

  private func hasPermissionOverride(caller : Principal, requiredRole : AccessControl.UserRole) : Bool {
    isHardcodedAdmin(caller) or AccessControl.hasPermission(accessControlState, caller, requiredRole);
  };

  private func isHotelActivated(hotelPrincipal : Principal) : Bool {
    if (hotelPrincipal.toText() == DEPRECATED_GOAT_HOTEL_ID_TEXT) {
      return false;
    };
    let isDirectActive = switch (directHotelActivations.get(hotelPrincipal)) {
      case (?directActivated) { directActivated };
      case (null) { false };
    };
    if (isDirectActive) { 
      return true;
    };
    switch (inviteTokens.get(hotelPrincipal.toText())) {
      case (?inviteToken) { 
        not inviteToken.isActive and inviteToken.usageCount > 0
      };
      case (null) { false };
    };
  };

  private func getHotelData(hotelId : Principal) : ?HotelData {
    hotelsList.toArray().find(func(h) { Principal.equal(h.id, hotelId) });
  };

  private func updateHotelData(updatedHotel : HotelData) : () {
    let filtered = hotelsList.toArray().filter(func(h) { not Principal.equal(h.id, updatedHotel.id) });
    hotelsList.clear();
    filtered.forEach(func(h) { hotelsList.add(h) });
    hotelsList.add(updatedHotel);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Users can view their own profile, admins can view any profile
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func makeMeAdmin() : async () {
    if (not isHardcodedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only the hardcoded admin can elevate privileges");
    };
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public shared ({ caller }) func createRoom(input : RoomInput) : async RoomView {
    if (not isHotelActivated(caller)) {
      Runtime.trap("Unauthorized: Caller is not an active hotel");
    };

    let roomId = nextRoomId;
    nextRoomId += 1;

    let discountedPrice = (input.pricePerNight.toFloat() * (100.0 - input.promoPercent.toFloat()) / 100.0).toInt().toNat();

    let newRoom : Room = {
      id = roomId;
      hotelId = caller;
      roomType = input.roomType;
      pricePerNight = input.pricePerNight;
      promoPercent = input.promoPercent;
      discountedPrice;
      currency = input.currency;
      pictures = input.pictures;
    };

    roomsMap.add(roomId, newRoom);

    switch (getHotelData(caller)) {
      case (?hotel) {
        hotel.rooms.add(roomId);
        updateHotelData(hotel);
      };
      case (null) {
        let newHotel : HotelData = {
          id = caller;
          name = "New Hotel";
          location = "";
          rooms = List.fromArray<Nat>([roomId]);
          address = "";
          mapLink = "";
          active = true;
          bookings = List.empty<Nat>();
          paymentMethods = List.empty<PaymentMethod>();
          contact = { whatsapp = null; email = null };
          subscriptionStatus = #test;
        };
        hotelsList.add(newHotel);
      };
    };

    toRoomView(newRoom);
  };

  public shared ({ caller }) func updateRoom(roomId : Nat, input : RoomInput) : async RoomView {
    switch (roomsMap.get(roomId)) {
      case (?existingRoom) {
        if (not Principal.equal(caller, existingRoom.hotelId) and not isAdminUser(caller)) {
          Runtime.trap("Unauthorized: Only the room owner hotel or admins can update rooms");
        };

        let discountedPrice = (input.pricePerNight.toFloat() * (100.0 - input.promoPercent.toFloat()) / 100.0).toInt().toNat();

        let updatedRoom : Room = {
          id = existingRoom.id;
          hotelId = existingRoom.hotelId;
          roomType = input.roomType;
          pricePerNight = input.pricePerNight;
          promoPercent = input.promoPercent;
          discountedPrice;
          currency = input.currency;
          pictures = input.pictures;
        };

        roomsMap.add(roomId, updatedRoom);
        toRoomView(updatedRoom);
      };
      case (null) { Runtime.trap("Room not found") };
    };
  };

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let code = "random-invite-code"; // Placeholder, implement random code logic
    code;
  };

  public shared func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    if (inviteCode != "random-invite-code") { // Placeholder, validate code properly
      Runtime.trap("Invalid invite code");
    };
    let _rsvp = {
      name;
      attending;
      timestamp = 0; // Placeholder
      inviteCode;
    };
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    [];
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    [];
  };

  func toRoomView(room : Room) : RoomView {
    {
      id = room.id;
      hotelId = room.hotelId;
      roomType = room.roomType;
      pricePerNight = room.pricePerNight;
      promoPercent = room.promoPercent;
      discountedPrice = room.discountedPrice;
      currency = room.currency;
      pictures = room.pictures;
    };
  };
};
