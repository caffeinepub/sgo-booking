import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

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

  // Include authorization mixin
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

  public query ({ caller }) func isHotelOwner(callerPrincipal : Principal, hotelId : Principal) : async Bool {
    switch (hotelOwners.get(hotelId)) {
      case (?owner) {
        Principal.equal(owner, callerPrincipal);
      };
      case (null) { false };
    };
  };

  // Authorization check helpers
  public shared ({ caller }) func makeMeAdmin() : async () {
    if (not isHardcodedAdmin(caller)) {
      Runtime.trap("Unauthorized: Only the hardcoded admin can elevate privileges");
    };
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public query ({ caller }) func validateInviteToken(token : Text) : async Bool {
    switch (inviteTokens.get(token)) {
      case (?inviteToken) { inviteToken.isActive };
      case (null) { false };
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
    if (not Principal.equal(caller, user) and not isAdminUser(caller)) {
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

  // Hotel profile management
  public shared ({ caller }) func createHotelProfile(name : Text, location : Text, address : Text, mapLink : Text, whatsapp : ?Text, email : ?Text) : async () {
    if (not isHotelActivated(caller)) {
      Runtime.trap("Unauthorized: Only active hotels can create a profile");
    };

    switch (getHotelData(caller)) {
      case (?_) {
        Runtime.trap("Hotel profile already exists. Use updateHotelProfile instead.");
      };
      case (null) {
        let newHotel : HotelData = {
          id = caller;
          name = name;
          location = location;
          rooms = List.empty<Nat>();
          address = address;
          mapLink = mapLink;
          active = true;
          bookings = List.empty<Nat>();
          paymentMethods = List.empty<PaymentMethod>();
          contact = {
            whatsapp;
            email;
          };
          subscriptionStatus = #test;
        };
        hotelsList.add(newHotel);
      };
    };
  };

  public shared ({ caller }) func updateHotelProfile(name : Text, location : Text, address : Text, mapLink : Text, whatsapp : ?Text, email : ?Text) : async () {
    if (not isHotelActivated(caller)) {
      Runtime.trap("Unauthorized: Only active hotels can update their profile");
    };

    switch (getHotelData(caller)) {
      case (?existingHotel) {
        let updatedHotel : HotelData = {
          existingHotel with
          name = name;
          location = location;
          address = address;
          mapLink = mapLink;
          contact = {
            whatsapp;
            email;
          };
        };
        updateHotelData(updatedHotel);
      };
      case (null) {
        let newHotel : HotelData = {
          id = caller;
          name = name;
          location = location;
          rooms = List.empty<Nat>();
          address = address;
          mapLink = mapLink;
          active = true;
          bookings = List.empty<Nat>();
          paymentMethods = List.empty<PaymentMethod>();
          contact = {
            whatsapp;
            email;
          };
          subscriptionStatus = #test;
        };
        hotelsList.add(newHotel);
      };
    };
  };

  public query ({ caller }) func getCallerHotelProfile() : async ?HotelDataView {
    if (not isHotelActivated(caller)) {
      return null;
    };

    switch (getHotelData(caller)) {
      case (?hotel) {
        let roomsArray = hotel.rooms.toArray().map(
          func(roomId : Nat) : RoomView {
            switch (roomsMap.get(roomId)) {
              case (?room) { toRoomView(room) };
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
    if (not isAdminUser(caller) and not Principal.equal(caller, hotelId)) {
      Runtime.trap("Unauthorized: Can only view your own hotel profile");
    };

    switch (getHotelData(hotelId)) {
      case (?hotel) {
        let roomsArray = hotel.rooms.toArray().map(
          func(roomId : Nat) : RoomView {
            switch (roomsMap.get(roomId)) {
              case (?room) { toRoomView(room) };
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

  public query func getHotels() : async [HotelDataView] {
    let activeHotels = hotelsList.toArray().filter(func(h) { h.active });
    
    activeHotels.map(func(hotel) {
      let roomsArray = hotel.rooms.toArray().map(
        func(roomId : Nat) : RoomView {
          switch (roomsMap.get(roomId)) {
            case (?room) { toRoomView(room) };
            case (null) {
              {
                id = roomId;
                hotelId = hotel.id;
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

      {
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
    });
  };

  // Admin hotel management
  public shared ({ caller }) func setHotelActiveStatus(hotelId : Principal, active : Bool) : async () {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can set hotel active status");
    };

    switch (getHotelData(hotelId)) {
      case (?hotel) {
        let updatedHotel = { hotel with active = active };
        updateHotelData(updatedHotel);
      };
      case (null) {
        Runtime.trap("Hotel not found");
      };
    };
  };

  public shared ({ caller }) func setHotelSubscriptionStatus(hotelId : Principal, status : SubscriptionStatus) : async () {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can set subscription status");
    };

    switch (getHotelData(hotelId)) {
      case (?hotel) {
        let updatedHotel = { hotel with subscriptionStatus = status };
        updateHotelData(updatedHotel);
      };
      case (null) {
        Runtime.trap("Hotel not found");
      };
    };
  };

  // Room Management
  func toRoomView(room : Room) : RoomView {
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

  private func matchesRoomQuery(room : Room, roomQuery : RoomQuery) : Bool {
    let hotelMatch = switch (roomQuery.hotelId) {
      case (?hotelId) { Principal.equal(room.hotelId, hotelId) };
      case (null) { true };
    };

    let minPriceMatch = switch (roomQuery.minPrice) {
      case (?minPrice) { room.pricePerNight >= minPrice };
      case (null) { true };
    };

    let maxPriceMatch = switch (roomQuery.maxPrice) {
      case (?maxPrice) { room.pricePerNight <= maxPrice };
      case (null) { true };
    };

    let roomTypeMatch = switch (roomQuery.roomType) {
      case (?roomType) { Text.equal(room.roomType, roomType) };
      case (null) { true };
    };

    hotelMatch and minPriceMatch and maxPriceMatch and roomTypeMatch;
  };

  public query ({ caller }) func getRooms(filters : RoomQuery) : async [RoomView] {
    let allRooms = roomsMap.toArray().map(func((_, room)) { room });
    let filteredRooms = allRooms.filter(func(room) { matchesRoomQuery(room, filters) });
    filteredRooms.map(toRoomView);
  };

  public shared ({ caller }) func createRoom(roomNumber : Text, roomType : Text, pricePerNight : Nat, currency : Text, pictures : [Text]) : async RoomView {
    if (not isHotelActivated(caller)) {
      Runtime.trap("Unauthorized: Caller is not an active hotel");
    };

    let roomId = nextRoomId;
    nextRoomId += 1;

    let newRoom : Room = {
      id = roomId;
      hotelId = caller;
      roomNumber = roomNumber;
      roomType = roomType;
      pricePerNight = pricePerNight;
      currency = currency;
      pictures = pictures;
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
          rooms = List.fromArray([roomId]);
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

  public shared ({ caller }) func updateRoom(roomId : Nat, roomNumber : Text, roomType : Text, pricePerNight : Nat, currency : Text, pictures : [Text]) : async RoomView {
    switch (roomsMap.get(roomId)) {
      case (?existingRoom) {
        if (not Principal.equal(caller, existingRoom.hotelId) and not isAdminUser(caller)) {
          Runtime.trap("Unauthorized: Only the room owner hotel or admins can update rooms");
        };

        let updatedRoom : Room = {
          id = existingRoom.id;
          hotelId = existingRoom.hotelId;
          roomNumber = roomNumber;
          roomType = roomType;
          pricePerNight = pricePerNight;
          currency = currency;
          pictures = pictures;
        };

        roomsMap.add(roomId, updatedRoom);
        toRoomView(updatedRoom);
      };
      case (null) { Runtime.trap("Room not found") };
    };
  };

  // Hotel activation
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

  public query ({ caller }) func isCallerHotelActivated() : async Bool {
    isHotelActivated(caller);
  };

  // Invite token management
  public shared ({ caller }) func createHotelInviteToken(_maxUses : Nat, boundPrincipal : ?Principal) : async InviteToken {
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

  public query ({ caller }) func getInviteTokens() : async [InviteToken] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can view invite tokens");
    };
    inviteTokens.values().toArray();
  };

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

  public shared ({ caller }) func consumeInviteToken(token : Text) : async Bool {
    switch (inviteTokens.get(token)) {
      case (?inviteToken) {
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
};
