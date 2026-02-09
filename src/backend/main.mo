import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

actor {
  include MixinStorage();

  // Hard-coded admin principal
  let HARDCODED_ADMIN : Principal = Principal.fromText("ayatf-afj3q-z5wvo-4ocoi-x7lve-uel5k-yhe6p-ahp57-ww5ch-bc72g-wae");

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
    rooms : List.List<Nat>;
    address : Text;
    mapLink : Text;
    active : Bool;
    bookings : List.List<Nat>;
    paymentMethods : List.List<PaymentMethod>;
    contact : HotelContact;
    subscriptionStatus : SubscriptionStatus;
  };

  public type RoomView = {
    id : Nat;
    hotelId : Principal;
    roomNumber : Text;
    roomType : Text;
    pricePerNight : Nat;
    currency : Text;
    pictures : [Text];
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

  let hotelsMap = Map.empty<Principal, HotelData>();
  let roomsMap = Map.empty<Nat, Room>();
  let bookingsMap = Map.empty<Nat, BookingRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let inviteTokens = Map.empty<Text, InviteToken>();
  let payments = Map.empty<Nat, Payment>();
  let directHotelActivations = Map.empty<Principal, Bool>();
  let accessControlState = AccessControl.initState();
  let inviteState = InviteLinksModule.initState();

  // Include authorization mixin
  include MixinAuthorization(accessControlState);

  // Helper function to check if caller is the hard-coded admin
  private func isHardcodedAdmin(caller : Principal) : Bool {
    Principal.equal(caller, HARDCODED_ADMIN);
  };

  // Helper function to check if caller is admin (either hard-coded or via access control)
  private func isAdminUser(caller : Principal) : Bool {
    isHardcodedAdmin(caller) or AccessControl.isAdmin(accessControlState, caller);
  };

  // Helper function to check permissions with hard-coded admin override
  private func hasPermissionOverride(caller : Principal, requiredRole : AccessControl.UserRole) : Bool {
    isHardcodedAdmin(caller) or AccessControl.hasPermission(accessControlState, caller, requiredRole);
  };

  // Helper function to check if a hotel is activated
  private func isHotelActivated(hotelPrincipal : Principal) : Bool {
    // Check direct activation first
    let isDirectActive = switch (directHotelActivations.get(hotelPrincipal)) {
      case (?directActivated) { directActivated };
      case (null) { false };
    };

    if (isDirectActive) { 
      return true;
    };

    // Check if there's a consumed invite token for this principal
    switch (inviteTokens.get(hotelPrincipal.toText())) {
      case (?inviteToken) { 
        // Token exists and has been consumed (not active anymore means it was used)
        not inviteToken.isActive and inviteToken.usageCount > 0
      };
      case (null) { false };
    };
  };

  // Expose check for VALID hotel invite token (unused token)
  public query ({ caller }) func isValidHotelInviteToken(hotelPrincipal : Principal) : async Bool {
    let isDirectActive = switch (directHotelActivations.get(hotelPrincipal)) {
      case (?directActivated) { directActivated };
      case (null) { false };
    };

    if (isDirectActive) { true } else {
      switch (inviteTokens.get(hotelPrincipal.toText())) {
        case (?inviteToken) { inviteToken.isActive };
        case (null) { false };
      };
    };
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (hasPermissionOverride(caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (hasPermissionOverride(caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Hotel profile management - needed for hotel activation flow
  public query ({ caller }) func getCallerHotelProfile() : async ?HotelDataView {
    // Check if caller is an activated hotel
    if (not isHotelActivated(caller)) {
      return null;
    };

    switch (hotelsMap.get(caller)) {
      case (?hotel) {
        let roomsArray = hotel.rooms.toArray().map(
          func(roomId : Nat) : RoomView {
            switch (roomsMap.get(roomId)) {
              case (?room) {
                {
                  id = room.id;
                  hotelId = room.hotelId;
                  roomNumber = room.roomNumber;
                  roomType = room.roomType;
                  pricePerNight = room.pricePerNight;
                  currency = room.currency;
                  pictures = room.pictures;
                };
              };
              case (null) {
                {
                  id = roomId;
                  hotelId = caller;
                  roomNumber = "";
                  roomType = "";
                  pricePerNight = 0;
                  currency = "";
                  pictures = [];
                };
              };
            };
          }
        );

        ?{
          id = hotel.id;
          name = hotel.name;
          location = hotel.location;
          address = hotel.address;
          mapLink = hotel.mapLink;
          active = hotel.active;
          rooms = roomsArray;
          bookings = hotel.bookings.toArray();
          paymentMethods = hotel.paymentMethods.toArray();
          contact = hotel.contact;
          subscriptionStatus = hotel.subscriptionStatus;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getHotelProfile(hotelId : Principal) : async ?HotelDataView {
    // Admins can view any hotel, hotels can view their own
    if (not isAdminUser(caller) and caller != hotelId) {
      Runtime.trap("Unauthorized: Can only view your own hotel profile");
    };

    switch (hotelsMap.get(hotelId)) {
      case (?hotel) {
        let roomsArray = hotel.rooms.toArray().map(
          func(roomId : Nat) : RoomView {
            switch (roomsMap.get(roomId)) {
              case (?room) {
                {
                  id = room.id;
                  hotelId = room.hotelId;
                  roomNumber = room.roomNumber;
                  roomType = room.roomType;
                  pricePerNight = room.pricePerNight;
                  currency = room.currency;
                  pictures = room.pictures;
                };
              };
              case (null) {
                {
                  id = roomId;
                  hotelId = hotelId;
                  roomNumber = "";
                  roomType = "";
                  pricePerNight = 0;
                  currency = "";
                  pictures = [];
                };
              };
            };
          }
        );

        ?{
          id = hotel.id;
          name = hotel.name;
          location = hotel.location;
          address = hotel.address;
          mapLink = hotel.mapLink;
          active = hotel.active;
          rooms = roomsArray;
          bookings = hotel.bookings.toArray();
          paymentMethods = hotel.paymentMethods.toArray();
          contact = hotel.contact;
          subscriptionStatus = hotel.subscriptionStatus;
        };
      };
      case (null) { null };
    };
  };

  // Invite-links public methods
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    // Any user including guests can submit RSVP
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  // Hotel Invite Token functionality
  // ADMIN ONLY: Create hotel invite token
  public shared ({ caller }) func createInviteToken(_maxUses : Nat, boundPrincipal : ?Principal) : async InviteToken {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can create invite tokens");
    };

    let principalText = switch (boundPrincipal) {
      case (?principal) { principal.toText() };
      case (null) { "unknown" };
    };

    let newToken : InviteToken = {
      token = principalText;
      isActive = true;
      issuedBy = caller;
      issuedAt = Time.now();
      maxUses = 1;
      usageCount = 0;
      boundPrincipal;
    };

    inviteTokens.add(principalText, newToken);
    newToken;
  };

  // ADMIN ONLY: Get all hotel invite tokens
  public query ({ caller }) func getInviteTokens() : async [InviteToken] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can view invite tokens");
    };
    inviteTokens.values().toArray();
  };

  // ADMIN ONLY: Get valid hotel invite tokens
  public query ({ caller }) func getValidHotelInviteTokens() : async [Text] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can view invite tokens");
    };
    let tokens = inviteTokens.toArray();
    tokens.filter(
      func(pair) {
        pair.1.isActive;
      }
    ).map(
      func(pair) {
        pair.0;
      }
    );
  };

  // Public: Consume invite token (increments usage count and deactivates)
  // AUTHORIZATION: Caller must match the boundPrincipal of the token
  public shared ({ caller }) func consumeInviteToken(token : Text) : async Bool {
    switch (inviteTokens.get(token)) {
      case (?inviteToken) {
        // Verify caller matches the bound principal
        switch (inviteToken.boundPrincipal) {
          case (?boundPrincipal) {
            if (not Principal.equal(caller, boundPrincipal)) {
              Runtime.trap("Unauthorized: This invite token is bound to a different principal");
            };
          };
          case (null) {
            Runtime.trap("Invalid token: No bound principal");
          };
        };

        if (inviteToken.isActive) {
          let updatedToken = {
            inviteToken with 
            isActive = false;
            usageCount = inviteToken.usageCount + 1;
          };
          inviteTokens.add(token, updatedToken);
          true;
        } else { 
          Runtime.trap("Token already consumed or inactive");
        };
      };
      case (null) { 
        Runtime.trap("Invalid token: Token not found");
      };
    };
  };

  // Hotel direct activations
  public shared ({ caller }) func activateHotelDirectly(hotelPrincipal : Principal) : async Bool {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform direct activations");
    };

    directHotelActivations.add(hotelPrincipal, true);
    true;
  };

  public query ({ caller }) func isHotelActiveByDirectActivation(hotelPrincipal : Principal) : async Bool {
    switch (directHotelActivations.get(hotelPrincipal)) {
      case (?status) { status };
      case (null) { false };
    };
  };

  // Check if caller's hotel account is activated (either by token consumption or direct activation)
  public query ({ caller }) func isCallerHotelActivated() : async Bool {
    isHotelActivated(caller);
  };
};
