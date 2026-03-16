import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";



actor {
  public type Donation = {
    name : Text;
    phone : Text;
    amount : Text;
    note : Text;
    timestamp : Time.Time;
  };

  public type DonationWithScreenshot = {
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
    status : Text; // "pending" | "approved"
    paymentDone : Bool;
    timestamp : Time.Time;
  };

  var nextDonationId = 0;
  let donations = Map.empty<Nat, Donation>();
  let donationScreenshots = Map.empty<Nat, Text>();

  var nextMemberId = 0;
  let members = Map.empty<Nat, MemberApplication>();

  public shared ({ caller }) func submitDonation(name : Text, phone : Text, amount : Text, note : Text, screenshot : Text) : async () {
    let donation : Donation = {
      name;
      phone;
      amount;
      note;
      timestamp = Time.now();
    };
    donations.add(nextDonationId, donation);
    if (screenshot != "") {
      donationScreenshots.add(nextDonationId, screenshot);
    };
    nextDonationId += 1;
  };

  public query ({ caller }) func getAllDonations() : async [DonationWithScreenshot] {
    donations.entries().map(func((id, d) : (Nat, Donation)) : DonationWithScreenshot {
      let ss = switch (donationScreenshots.get(id)) {
        case (?s) { s };
        case null { "" };
      };
      {
        name = d.name;
        phone = d.phone;
        amount = d.amount;
        note = d.note;
        screenshot = ss;
        timestamp = d.timestamp;
      };
    }).toArray();
  };

  public shared ({ caller }) func clearAllDonations() : async () {
    donations.clear();
    donationScreenshots.clear();
    nextDonationId := 0;
  };

  public shared ({ caller }) func deleteDonationById(id : Nat) : async () {
    ignore donations.remove(id);
    ignore donationScreenshots.remove(id);
  };

  // Membership functions
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
      timestamp = Time.now();
    };
    members.add(id, app);
    nextMemberId += 1;
    id;
  };

  public query ({ caller }) func getAllMemberApplications() : async [MemberApplication] {
    members.values().toArray();
  };

  public shared ({ caller }) func approveMemberApplication(id : Nat) : async () {
    switch (members.get(id)) {
      case (?app) {
        let updated : MemberApplication = {
          id = app.id;
          name = app.name;
          phone = app.phone;
          address = app.address;
          occupation = app.occupation;
          photo = app.photo;
          status = "approved";
          paymentDone = app.paymentDone;
          timestamp = app.timestamp;
        };
        members.add(id, updated);
      };
      case null {};
    };
  };

  public shared ({ caller }) func deleteMemberApplication(id : Nat) : async () {
    ignore members.remove(id);
  };

  // Public: find member by phone and name (case-insensitive trim)
  public query func getMemberByPhoneAndName(phone : Text, name : Text) : async ?MemberApplication {
    let phoneTrim = phone.trim(#char ' ');
    let nameTrim = name.trim(#char ' ');
    for ((_, app) in members.entries()) {
      let phoneMatch = app.phone.trim(#char ' ') == phoneTrim;
      let nameMatch = app.name.trim(#char ' ') == nameTrim;
      if (phoneMatch and nameMatch) {
        return ?app;
      };
    };
    null;
  };

  // Public: confirm payment for a member (called after member pays via QR)
  public shared func confirmMemberPayment(id : Nat) : async Bool {
    switch (members.get(id)) {
      case (?app) {
        if (app.status == "approved") {
          let updated : MemberApplication = {
            id = app.id;
            name = app.name;
            phone = app.phone;
            address = app.address;
            occupation = app.occupation;
            photo = app.photo;
            status = app.status;
            paymentDone = true;
            timestamp = app.timestamp;
          };
          members.add(id, updated);
          return true;
        };
        return false;
      };
      case null { return false };
    };
  };
};
