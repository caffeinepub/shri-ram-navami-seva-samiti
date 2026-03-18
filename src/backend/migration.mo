import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  public type OldDonation = {
    name : Text;
    phone : Text;
    amount : Text;
    note : Text;
    timestamp : Time.Time;
  };

  public type OldMemberApplication = {
    id : Nat;
    name : Text;
    phone : Text;
    address : Text;
    occupation : Text;
    photo : Text;
    status : Text;
    paymentDone : Bool;
    timestamp : Time.Time;
  };

  public type OldActor = {
    nextDonationId : Nat;
    donations : Map.Map<Nat, OldDonation>;
    donationScreenshots : Map.Map<Nat, Text>;

    nextMemberId : Nat;
    members : Map.Map<Nat, OldMemberApplication>;
    memberPaymentScreenshots : Map.Map<Nat, Text>;
  };

  public type NewDonation = {
    id : Nat;
    name : Text;
    phone : Text;
    amount : Text;
    note : Text;
    screenshot : Text;
    timestamp : Time.Time;
  };

  public type NewMemberApplication = {
    id : Nat;
    name : Text;
    phone : Text;
    address : Text;
    occupation : Text;
    photo : Text;
    status : Text;
    paymentDone : Bool;
    paymentScreenshot : Text;
    timestamp : Time.Time;
  };

  public type NewActor = {
    donationsArray : [NewDonation];
    membersArray : [NewMemberApplication];
    nextDonationId : Nat;
    nextMemberId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let donationsArray = old.donations.toArray().map(
      func((id, d)) {
        {
          id;
          name = d.name;
          phone = d.phone;
          amount = d.amount;
          note = d.note;
          screenshot = switch (old.donationScreenshots.get(id)) {
            case (?s) { s };
            case (_) { "" };
          };
          timestamp = d.timestamp;
        };
      }
    );

    let membersArray = old.members.toArray().map(
      func((id, app)) {
        {
          id = app.id;
          name = app.name;
          phone = app.phone;
          address = app.address;
          occupation = app.occupation;
          photo = app.photo;
          status = app.status;
          paymentDone = app.paymentDone;
          paymentScreenshot = switch (old.memberPaymentScreenshots.get(id)) {
            case (?s) { s };
            case (_) { "" };
          };
          timestamp = app.timestamp;
        };
      }
    );

    {
      donationsArray;
      membersArray;
      nextDonationId = old.nextDonationId;
      nextMemberId = old.nextMemberId;
    };
  };
};
