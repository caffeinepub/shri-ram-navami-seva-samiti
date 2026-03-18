import Time "mo:core/Time";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type Donation = {
    id : Nat;
    name : Text;
    phone : Text;
    amount : Text;
    note : Text;
    screenshot : Text;
    timestamp : Time.Time;
  };

  public type MemberApplication = {
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

  var donationsArray : [Donation] = [];
  var membersArray : [MemberApplication] = [];
  var nextDonationId = 0;
  var nextMemberId = 0;

  // ---- Donations ----

  public shared ({ caller }) func submitDonation(name : Text, phone : Text, amount : Text, note : Text, screenshot : Text) : async () {
    let d : Donation = {
      id = nextDonationId;
      name;
      phone;
      amount;
      note;
      screenshot;
      timestamp = Time.now();
    };
    donationsArray := donationsArray.concat([d]);
    nextDonationId += 1;
  };

  public query ({ caller }) func getAllDonations() : async [Donation] {
    donationsArray;
  };

  public shared ({ caller }) func clearAllDonations() : async () {
    donationsArray := [];
    nextDonationId := 0;
  };

  public shared ({ caller }) func deleteDonationById(id : Nat) : async () {
    donationsArray := donationsArray.filter(func(d) { d.id != id });
  };

  // ---- Membership ----

  public shared ({ caller }) func submitMemberApplication(name : Text, phone : Text, address : Text, occupation : Text, photo : Text) : async Nat {
    let id = nextMemberId;
    let app : MemberApplication = {
      id;
      name;
      phone;
      address;
      occupation;
      photo;
      status = "pending";
      paymentDone = false;
      paymentScreenshot = "";
      timestamp = Time.now();
    };
    membersArray := membersArray.concat([app]);
    nextMemberId += 1;
    id;
  };

  public query ({ caller }) func getAllMemberApplications() : async [MemberApplication] {
    membersArray;
  };

  public shared ({ caller }) func approveMemberApplication(id : Nat) : async () {
    membersArray := membersArray.map(func(app) {
      if (app.id == id) {
        { app with status = "approved" };
      } else { app };
    });
  };

  public shared ({ caller }) func deleteMemberApplication(id : Nat) : async () {
    membersArray := membersArray.filter(func(app) { app.id != id });
  };

  public query ({ caller }) func getMemberByPhoneAndName(phone : Text, name : Text) : async ?MemberApplication {
    let phoneTrim = phone.trim(#char ' ');
    let nameTrim = name.trim(#char ' ');
    let found = membersArray.find(
      func(app) {
        app.phone.trim(#char ' ') == phoneTrim and app.name.trim(#char ' ') == nameTrim
      }
    );
    found;
  };

  public shared ({ caller }) func submitPaymentProof(id : Nat, screenshot : Text) : async Bool {
    var found = false;
    membersArray := membersArray.map(func(app) {
      if (app.id == id and app.status == "approved" and not app.paymentDone) {
        found := true;
        { app with paymentScreenshot = screenshot };
      } else { app };
    });
    found;
  };

  public shared ({ caller }) func confirmMemberPayment(id : Nat) : async Bool {
    var found = false;
    membersArray := membersArray.map(func(app) {
      if (app.id == id and app.status == "approved") {
        found := true;
        { app with paymentDone = true };
      } else { app };
    });
    found;
  };
};
