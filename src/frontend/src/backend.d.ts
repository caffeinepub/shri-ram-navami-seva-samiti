import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Donation {
    name: string;
    note: string;
    timestamp: Time;
    phone: string;
    amount: string;
}
export type Time = bigint;
export interface backendInterface {
    getAllDonations(): Promise<Array<Donation>>;
    submitDonation(name: string, phone: string, amount: string, note: string): Promise<void>;
}
