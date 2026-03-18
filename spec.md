# Shri Ram Navami Seva Samiti

## Current State
Backend uses `stable var donations = Map.empty<Nat, Donation>()` and similar for members. The `mo:core/Map` type is not a stable type, so data is lost on every canister upgrade.

## Requested Changes (Diff)

### Add
- Stable arrays for donations and members storage
- System preupgrade/postupgrade hooks to persist data

### Modify
- Replace `Map`-based storage with stable arrays (`[var ...]` pattern using `Buffer` rebuilt from stable arrays on init)
- All CRUD operations updated to work with stable arrays

### Remove
- `mo:core/Map` imports and usage

## Implementation Plan
1. Rewrite backend to store donations and members in stable `var` arrays (not HashMap)
2. All functions (submit, getAll, approve, delete, confirmPayment, submitPaymentProof, getMemberByPhoneAndName) updated accordingly
3. Data now survives canister upgrades
