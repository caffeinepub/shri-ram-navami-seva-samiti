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

  var nextDonationId = 0;
  let donations = Map.empty<Nat, Donation>();

  public shared ({ caller }) func submitDonation(name : Text, phone : Text, amount : Text, note : Text) : async () {
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
    nextDonationId += 1;
  };

  public query ({ caller }) func getAllDonations() : async [Donation] {
    donations.values().toArray();
  };
};
