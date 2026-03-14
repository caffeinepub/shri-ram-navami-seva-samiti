import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type Donation = {
    name : Text;
    phone : Text;
    amount : Text;
    note : Text;
    timestamp : Int;
  };

  type OldActor = {};
  type NewActor = {
    nextDonationId : Nat;
    donations : Map.Map<Nat, Donation>;
  };

  public func run(_old : OldActor) : NewActor {
    {
      nextDonationId = 0;
      donations = Map.empty<Nat, Donation>();
    };
  };
};
