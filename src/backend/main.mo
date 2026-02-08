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
  public shared ({ caller }) func createInviteToken(maxUses : Nat, boundPrincipal : ?Principal) : async InviteToken {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can create invite tokens");
    };

    // Generate token logic
    let token = "HOTEL_" # Time.now().toText() # maxUses.toText();

    let newToken : InviteToken = {
      token;
      isActive = true;
      issuedBy = caller;
      issuedAt = Time.now();
      maxUses;
      usageCount = 0;
      boundPrincipal;
    };

    inviteTokens.add(token, newToken);
    newToken;
  };

  // ADMIN ONLY: Get all hotel invite tokens
  public query ({ caller }) func getInviteTokens() : async [InviteToken] {
    if (not isAdminUser(caller)) {
      Runtime.trap("Unauthorized: Only admins can view invite tokens");
    };
    inviteTokens.values().toArray();
  };

  // Public: Validate invite token
  public shared ({ caller }) func validateInviteToken(token : Text) : async Bool {
    switch (inviteTokens.get(token)) {
      case (?_token) {
        true;
      };
      case (null) { false };
    };
  };

  // Public: Consume invite token (increments usage count)
  public shared ({ caller }) func consumeInviteToken(token : Text) : async Bool {
    switch (inviteTokens.get(token)) {
      case (?inviteToken) {
        if (inviteToken.isActive and inviteToken.usageCount < inviteToken.maxUses) {
          let updatedToken = {
            inviteToken with
            usageCount = inviteToken.usageCount + 1;
            isActive = (inviteToken.usageCount + 1 < inviteToken.maxUses);
          };
          inviteTokens.add(token, updatedToken);
          true;
        } else { false };
      };
      case (null) { false };
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

  public query ({ caller }) func isHotelActiveByDirectActivation(_hotelPrincipal : Principal) : async Bool {
    switch (directHotelActivations.get(caller)) {
      case (?_status) { true };
      case (null) { false };
    };
  };
};
