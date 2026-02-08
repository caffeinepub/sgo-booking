import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Array "mo:core/Array";
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
  include MixinAuthorization(accessControlState);
  let inviteState = InviteLinksModule.initState();

  public shared ({ caller }) func makeMeAdmin() : async () {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return;
    };
    AccessControl.initialize(accessControlState, caller, "", "");
  };

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  public shared ({ caller }) func createBooking(
    hotelId : Principal,
    roomId : Nat,
    checkIn : Int,
    checkOut : Int,
    guests : Nat,
    _currency : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can create bookings");
    };

    let room = switch (roomsMap.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?r) {
        if (r.hotelId != hotelId) {
          Runtime.trap("Room does not belong to specified hotel");
        };
        r;
      };
    };

    switch (hotelsMap.get(hotelId)) {
      case (null) { Runtime.trap("Hotel not found") };
      case (?hotel) {
        if (not hotel.active) {
          Runtime.trap("Hotel is not active");
        };
        if (hotel.subscriptionStatus == #unpaid) {
          Runtime.trap("Hotel subscription is unpaid");
        };
      };
    };

    if (guests > 2) {
      Runtime.trap("Booking cannot be created for more than 2 persons (2 beds by default). For 3 or more you need an extra room:) \nHotels must provide discounts or money-back in case booking is not for 2 persons.");
    };

    let totalPrice = calculateTotalPrice(checkIn, checkOut, room.pricePerNight);
    let newBooking : BookingRequest = {
      id = bookingsMap.size() + 1;
      hotelId = ?hotelId;
      roomId;
      userId = caller;
      checkIn;
      checkOut;
      totalPrice;
      status = #pendingTransfer;
      guests;
      timestamp = Time.now();
      paymentProof = null;
      currency = room.currency;
    };
    bookingsMap.add(newBooking.id, newBooking);
    updateHotelBookingsMap(hotelId, ?newBooking.id, null);
    newBooking.id;
  };

  func calculateTotalPrice(checkIn : Int, checkOut : Int, pricePerNight : Nat) : Nat {
    let nanosecondsInDay : Nat = 86_400_000_000_000;
    let staysIfZero = 1;

    if (checkOut <= checkIn) { Runtime.trap("Invalid check-in/check-out times") } else {
      let stayLengthNanos = Int.abs((checkOut - checkIn)).toNat();
      let nights =
        if (stayLengthNanos == 0) { staysIfZero } else {
          ((stayLengthNanos + nanosecondsInDay) - 1) / nanosecondsInDay;
        };
      pricePerNight * nights;
    };
  };

  public query ({ caller }) func getBookings(filters : BookingQuery) : async BookingQueryResult {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);

    let filteredBookings = List.empty<BookingRequest>();

    for (booking in bookingsMap.values()) {
      let matchesHotel = switch (filters.hotelId) {
        case (null) { true };
        case (?hId) { booking.hotelId == ?hId };
      };

      let matchesStatus = switch (filters.status) {
        case (null) { true };
        case (?status) { booking.status == status };
      };

      let matchesDate = switch (filters.fromDate, filters.toDate) {
        case (null, null) { true };
        case (?from, null) { booking.checkIn >= from };
        case (null, ?to) { booking.checkOut <= to };
        case (?from, ?to) { booking.checkIn >= from and booking.checkOut <= to };
      };

      let matchesPrice = switch (filters.minPrice, filters.maxPrice) {
        case (null, null) { true };
        case (?min, null) { booking.totalPrice >= min };
        case (null, ?max) { booking.totalPrice <= max };
        case (?min, ?max) { booking.totalPrice >= min and booking.totalPrice <= max };
      };

      let canView = if (isAdmin) {
        true;
      } else if (isUser and booking.userId == caller) {
        true;
      } else {
        switch (booking.hotelId) {
          case (?hId) {
            isHotelOwner(caller, hId) and AccessControl.hasPermission(accessControlState, caller, #user);
          };
          case (null) { false };
        };
      };

      if (
        matchesHotel and matchesStatus and matchesDate and matchesPrice and canView
      ) {
        filteredBookings.add(booking);
      };
    };

    let filteredArray = filteredBookings.toArray();
    {
      bookings = filteredArray;
      totalCount = filteredArray.size();
    };
  };

  public shared ({ caller }) func setPaymentProof(bookingId : Nat, paymentProof : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload payment proof");
    };

    if (not isBookingOwner(caller, bookingId)) {
      Runtime.trap("Unauthorized: Can only upload payment proof for your own bookings");
    };

    switch (bookingsMap.get(bookingId)) {
      case (?booking) {
        if (booking.status != #pendingTransfer) {
          Runtime.trap("Cannot upload payment proof for booking in current status");
        };
        let updatedBooking = {
          booking with
          paymentProof = ?paymentProof;
          status = #booked;
        };
        bookingsMap.add(bookingId, updatedBooking);
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  public shared ({ caller }) func updateBookingStatus(
    bookingId : Nat,
    newStatus : BookingStatus,
  ) : async () {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    switch (bookingsMap.get(bookingId)) {
      case (?booking) {
        let hotelId = switch (booking.hotelId) {
          case (?hId) { hId };
          case (null) { Runtime.trap("Booking has no associated hotel") };
        };

        let isOwner = isHotelOwner(caller, hotelId) and AccessControl.hasPermission(accessControlState, caller, #user);

        if (not isAdmin and not isOwner) {
          Runtime.trap("Unauthorized: Only hotel owner or admin can update booking status");
        };

        let updatedBooking = { booking with status = newStatus };
        bookingsMap.add(bookingId, updatedBooking);
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  public shared ({ caller }) func recordStayCompletion(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record stay completion");
    };

    switch (bookingsMap.get(bookingId)) {
      case (?booking) {
        let hotelId = switch (booking.hotelId) {
          case (?hId) { hId };
          case (null) { Runtime.trap("Booking has no associated hotel") };
        };

        if (not isHotelOwner(caller, hotelId)) {
          Runtime.trap("Unauthorized: Only hotel owner can record stay completion");
        };
        if (booking.status != #booked and booking.status != #checkedIn) {
          Runtime.trap("Cannot complete stay for booking in current status");
        };

        let updatedBooking = { booking with status = #checkedIn };
        bookingsMap.add(bookingId, updatedBooking);
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  func updateHotelBookingsMap(hotelId : Principal, bookingId : ?Nat, _otherData : ?Text) {
    switch (hotelsMap.get(hotelId)) {
      case (?hotel) {
        switch (bookingId) {
          case (?id) {
            let updatedBookings = List.fromArray<Nat>(
              hotel.bookings.toArray().concat([id])
            );
            let updatedHotel = {
              hotel with
              bookings = updatedBookings;
            };
            hotelsMap.add(hotelId, updatedHotel);
          };
          case (null) {};
        };
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func createInviteToken(maxUses : Nat, boundPrincipal : ?Principal) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create invite tokens");
    };

    let token = (inviteTokens.size() + 1).toText() # "-invite-" # Time.now().toText();
    let invite : InviteToken = {
      token;
      isActive = true;
      issuedBy = caller;
      issuedAt = Time.now();
      maxUses;
      usageCount = 0;
      boundPrincipal;
    };
    inviteTokens.add(token, invite);
    token;
  };

  public query func validateInviteToken(token : Text) : async Bool {
    switch (inviteTokens.get(token)) {
      case (?invite) {
        if (not invite.isActive or invite.usageCount >= invite.maxUses) {
          return false;
        };
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func consumeInviteToken(token : Text) : async () {
    switch (hotelsMap.get(caller)) {
      case (?_) { Runtime.trap("User already has a hotel account") };
      case (null) {};
    };

    switch (inviteTokens.get(token)) {
      case (?invite) {
        if (not invite.isActive or invite.usageCount >= invite.maxUses) {
          Runtime.trap("Invalid or expired token");
        };

        switch (invite.boundPrincipal) {
          case (?boundTo) {
            if (caller != boundTo) {
              Runtime.trap("Unauthorized: Token is bound to a different principal");
            };
          };
          case (null) {};
        };

        let updatedInvite = {
          invite with
          usageCount = invite.usageCount + 1;
          isActive = invite.usageCount + 1 < invite.maxUses;
        };
        inviteTokens.add(token, updatedInvite);

        directHotelActivations.add(caller, true);

        let hotel : HotelData = {
          id = caller;
          name = "New Hotel";
          location = "";
          address = "";
          mapLink = "";
          active = true;
          rooms = List.empty<Nat>();
          bookings = List.empty<Nat>();
          paymentMethods = List.empty<PaymentMethod>();
          contact = {
            whatsapp = null;
            email = null;
          };
          subscriptionStatus = #unpaid;
        };
        hotelsMap.add(caller, hotel);
      };
      case (null) { Runtime.trap("Invalid token") };
    };
  };

  public query ({ caller }) func getInviteTokens() : async [InviteToken] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view invite tokens");
    };
    inviteTokens.values().toArray();
  };

  public query ({ caller }) func getHotels() : async [HotelDataView] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (isAdmin) {
      hotelsMap.values().toArray().map(
        func(hotel) { toHotelDataView(hotel) }
      );
    } else {
      let visibleHotels = List.empty<HotelData>();
      for (hotel in hotelsMap.values()) {
        if (hotel.active and (hotel.subscriptionStatus == #paid or hotel.subscriptionStatus == #test)) {
          visibleHotels.add(hotel);
        };
      };
      visibleHotels.toArray().map(
        func(hotel) { toHotelDataView(hotel) }
      );
    };
  };

  func toHotelDataView(hotel : HotelData) : HotelDataView {
    {
      id = hotel.id;
      name = hotel.name;
      location = hotel.location;
      address = hotel.address;
      mapLink = hotel.mapLink;
      active = hotel.active;
      rooms = getRoomViewsForHotel(hotel.id);
      bookings = hotel.bookings.toArray();
      paymentMethods = hotel.paymentMethods.toArray();
      contact = hotel.contact;
      subscriptionStatus = hotel.subscriptionStatus;
    };
  };

  func getRoomViewsForHotel(hotelId : Principal) : [RoomView] {
    let hotelRooms = List.empty<RoomView>();
    for (room in roomsMap.values()) {
      if (room.hotelId == hotelId) {
        hotelRooms.add(toRoomView(room));
      };
    };
    hotelRooms.toArray();
  };

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

  public query ({ caller }) func getCallerHotelProfile() : async ?HotelDataView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access hotel dashboard");
    };

    if (not isActivatedHotelOwner(caller)) {
      Runtime.trap("Unauthorized: Hotel owner requires activation");
    };

    switch (hotelsMap.get(caller)) {
      case (?hotel) { ?toHotelDataView(hotel) };
      case (null) { null };
    };
  };

  public shared ({ caller }) func updateHotelProfile(
    name : Text,
    location : Text,
    address : Text,
    mapLink : Text,
    whatsapp : ?Text,
    email : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update hotel profile");
    };

    if (not isActivatedHotelOwner(caller)) {
      Runtime.trap("Unauthorized: Hotel owner requires activation");
    };

    switch (hotelsMap.get(caller)) {
      case (?hotel) {
        let updatedHotel = {
          hotel with
          name = name;
          location = location;
          address = address;
          mapLink = mapLink;
          contact = { whatsapp; email };
        };
        hotelsMap.add(caller, updatedHotel);
      };
      case (null) { Runtime.trap("Hotel not found") };
    };
  };

  public shared ({ caller }) func addPaymentMethod(
    name : Text,
    details : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add payment methods");
    };

    if (not isActivatedHotelOwner(caller)) {
      Runtime.trap("Unauthorized: Hotel owner requires activation");
    };

    switch (hotelsMap.get(caller)) {
      case (?hotel) {
        let newMethod : PaymentMethod = {
          name;
          details;
        };
        hotel.paymentMethods.add(newMethod);
        hotelsMap.add(caller, hotel);
      };
      case (null) { Runtime.trap("Hotel not found") };
    };
  };

  public shared ({ caller }) func removePaymentMethod(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove payment methods");
    };

    if (not isActivatedHotelOwner(caller)) {
      Runtime.trap("Unauthorized: Hotel owner requires activation");
    };

    switch (hotelsMap.get(caller)) {
      case (?hotel) {
        if (index >= hotel.paymentMethods.size()) {
          Runtime.trap("Invalid index");
        };
        let updatedMethods = List.empty<PaymentMethod>();
        var currentIndex = 0;
        for (method in hotel.paymentMethods.values()) {
          if (currentIndex != index) { updatedMethods.add(method) };
          currentIndex += 1;
        };
        let updatedHotel = { hotel with paymentMethods = updatedMethods };
        hotelsMap.add(caller, updatedHotel);
      };
      case (null) { Runtime.trap("Hotel not found") };
    };
  };

  public shared ({ caller }) func setHotelActiveStatus(hotelId : Principal, active : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can change hotel status");
    };

    switch (hotelsMap.get(hotelId)) {
      case (?hotel) {
        let updatedHotel = { hotel with active = active };
        hotelsMap.add(hotelId, updatedHotel);
      };
      case (null) { Runtime.trap("Hotel not found") };
    };
  };

  public shared ({ caller }) func setHotelSubscriptionStatus(
    hotelId : Principal,
    status : SubscriptionStatus,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set subscription status");
    };

    switch (hotelsMap.get(hotelId)) {
      case (?hotel) {
        let updatedHotel = { hotel with subscriptionStatus = status };
        hotelsMap.add(hotelId, updatedHotel);
      };
      case (null) { Runtime.trap("Hotel not found") };
    };
  };

  public query ({ caller }) func getRooms(filters : RoomQuery) : async [RoomView] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filteredRooms = List.empty<RoomView>();

    for (room in roomsMap.values()) {
      let matchesHotel = switch (filters.hotelId) {
        case (null) { true };
        case (?hId) { room.hotelId == hId };
      };

      let matchesType = switch (filters.roomType) {
        case (null) { true };
        case (?t) { Text.equal(room.roomType, t) };
      };

      let matchesPrice = switch (filters.minPrice, filters.maxPrice) {
        case (null, null) { true };
        case (?min, null) { room.pricePerNight >= min };
        case (null, ?max) { room.pricePerNight <= max };
        case (?min, ?max) { room.pricePerNight >= min and room.pricePerNight <= max };
      };

      let hotelVisible = if (isAdmin) {
        true;
      } else {
        switch (hotelsMap.get(room.hotelId)) {
          case (?hotel) {
            hotel.active and (hotel.subscriptionStatus == #paid or hotel.subscriptionStatus == #test);
          };
          case (null) { false };
        };
      };

      if (matchesHotel and matchesPrice and matchesType and hotelVisible) {
        filteredRooms.add(toRoomView(room));
      };
    };
    filteredRooms.toArray();
  };

  public shared ({ caller }) func createRoom(
    roomNumber : Text,
    roomType : Text,
    pricePerNight : Nat,
    currency : Text,
    pictures : [Text],
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create rooms");
    };

    if (not isActivatedHotelOwner(caller)) {
      Runtime.trap("Unauthorized: Hotel owner requires activation");
    };

    let newRoomId = roomsMap.size() + 1;

    let room : Room = {
      id = newRoomId;
      hotelId = caller;
      roomNumber;
      roomType;
      pricePerNight;
      currency;
      pictures;
    };
    roomsMap.add(newRoomId, room);
    room.id;
  };

  public shared ({ caller }) func updateRoom(
    roomId : Nat,
    roomNumber : Text,
    roomType : Text,
    pricePerNight : Nat,
    currency : Text,
    pictures : [Text],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update rooms");
    };

    if (not isActivatedHotelOwner(caller)) {
      Runtime.trap("Unauthorized: Hotel owner requires activation");
    };

    switch (roomsMap.get(roomId)) {
      case (?room) {
        if (room.hotelId != caller) {
          Runtime.trap("Unauthorized: Can only update your own hotel's rooms");
        };

        let updatedRoom = {
          room with
          roomNumber = roomNumber;
          roomType = roomType;
          pricePerNight = pricePerNight;
          currency = currency;
          pictures = pictures;
        };
        roomsMap.add(roomId, updatedRoom);
      };
      case (null) { Runtime.trap("Room not found") };
    };
  };

  public shared ({ caller }) func createMockBooking(
    hotelId : ?Principal,
    roomId : Nat,
    checkIn : Int,
    checkOut : Int,
    guests : Nat,
    totalPrice : Nat,
    currency : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create mock bookings");
    };

    let bookingId = bookingsMap.size() + 1;
    let newBooking : BookingRequest = {
      id = bookingId;
      hotelId;
      roomId;
      userId = caller;
      checkIn;
      checkOut;
      totalPrice;
      status = #pendingTransfer;
      guests;
      timestamp = Time.now();
      paymentProof = null;
      currency;
    };
    bookingsMap.add(newBooking.id, newBooking);

    switch (hotelId) {
      case (?hId) { updateHotelBookingsMap(hId, ?newBooking.id, null) };
      case (null) {};
    };
  };

  func assignHotelAndRoomsToBooking(_bookingId : Nat) {};

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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

  public shared ({ caller }) func activateHotelOwner(hotelId : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can activate hotel owners");
    };

    directHotelActivations.add(hotelId, true);

    switch (hotelsMap.get(hotelId)) {
      case (?hotel) {
        let updatedHotel = { hotel with active = true };
        hotelsMap.add(hotelId, updatedHotel);
      };
      case (null) {
        let hotel : HotelData = {
          id = hotelId;
          name = "New Hotel";
          location = "";
          address = "";
          mapLink = "";
          active = true;
          rooms = List.empty<Nat>();
          bookings = List.empty<Nat>();
          paymentMethods = List.empty<PaymentMethod>();
          contact = {
            whatsapp = null;
            email = null;
          };
          subscriptionStatus = #unpaid;
        };
        hotelsMap.add(hotelId, hotel);
      };
    };
  };

  func isActivatedHotelOwner(caller : Principal) : Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };

    switch (directHotelActivations.get(caller)) {
      case (?true) { return true };
      case (?false) { return false };
      case (null) {};
    };

    switch (hotelsMap.get(caller)) {
      case (?hotel) { hotel.active };
      case (null) { false };
    };
  };

  func isHotelOwner(caller : Principal, hotelId : Principal) : Bool {
    caller == hotelId;
  };

  func isBookingOwner(caller : Principal, bookingId : Nat) : Bool {
    switch (bookingsMap.get(bookingId)) {
      case (?booking) { booking.userId == caller };
      case (null) { false };
    };
  };

  func getHotelForBooking(bookingId : Nat) : ?Principal {
    switch (bookingsMap.get(bookingId)) {
      case (?booking) { booking.hotelId };
      case (null) { null };
    };
  };

  func getBooking(bookingId : Nat) : ?BookingRequest {
    bookingsMap.get(bookingId);
  };

  public query ({ caller }) func getRoom(roomId : Nat) : async ?RoomView {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    switch (roomsMap.get(roomId)) {
      case (null) { null };
      case (?room) {
        // Admin can see all rooms
        if (isAdmin) {
          return ?toRoomView(room);
        };

        // Check if hotel is visible (active and paid/test subscription)
        switch (hotelsMap.get(room.hotelId)) {
          case (?hotel) {
            if (hotel.active and (hotel.subscriptionStatus == #paid or hotel.subscriptionStatus == #test)) {
              // Hotel is visible, allow all users (including guests) to view
              ?toRoomView(room);
            } else if (isHotelOwner(caller, room.hotelId) and AccessControl.hasPermission(accessControlState, caller, #user)) {
              // Hotel owner can see their own rooms even if hotel is not visible
              ?toRoomView(room);
            } else {
              null;
            };
          };
          case (null) { null };
        };
      };
    };
  };
};

