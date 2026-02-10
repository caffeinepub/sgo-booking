import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    hotelsList : List.List<{
      id : Principal;
      name : Text;
      location : Text;
      rooms : List.List<Nat>;
      address : Text;
      mapLink : Text;
      active : Bool;
      bookings : List.List<Nat>;
      paymentMethods : List.List<{
        name : Text;
        details : Text;
      }>;
      contact : { whatsapp : ?Text; email : ?Text };
      subscriptionStatus : {
        #paid;
        #unpaid;
        #test;
      };
    }>;
    directHotelActivations : Map.Map<Principal, Bool>;
    accessControlState : AccessControl.AccessControlState;
    inviteState : InviteLinksModule.InviteLinksSystemState;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
