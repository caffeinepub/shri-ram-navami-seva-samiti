import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";



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
    timestamp : Time.Time;
  };

  var nextDonationId = 0;
  let donations = Map.empty<Nat, Donation>();
  let donationScreenshots = Map.empty<Nat, Text>();

  var nextMemberId = 0;
  let members = Map.empty<Nat, MemberApplication>();

  public shared ({ caller }) func submitDonation(name : Text, phone : Text, amount : Text, note : Text, screenshot : Text) : async () {
    if (name == "") { Runtime.trap("Name cannot be empty") };
    if (phone == "") { Runtime.trap("Phone number cannot be empty") };
    if (amount == "") { Runtime.trap("Amount cannot be empty") };

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
      }
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
    if (name == "") { Runtime.trap("Name cannot be empty") };
    if (phone == "") { Runtime.trap("Phone cannot be empty") };

    let app : MemberApplication = {
      id = nextMemberId;
      name;
      phone;
      address;
      occupation;
      photo;
      status = "pending";
      timestamp = Time.now();
    };
    members.add(nextMemberId, app);
    let id = nextMemberId;
    nextMemberId += 1;
    id
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
          timestamp = app.timestamp;
        };
        members.add(id, updated);
      };
      case null { Runtime.trap("Member not found") };
    };
  };

  public shared ({ caller }) func deleteMemberApplication(id : Nat) : async () {
    ignore members.remove(id);
  };
};
