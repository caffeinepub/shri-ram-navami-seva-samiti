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
    screenshot: string;
}
export interface MemberApplication {
    id: bigint;
    name: string;
    phone: string;
    address: string;
    occupation: string;
    photo: string;
    status: string;
    timestamp: Time;
}
export type Time = bigint;
export interface backendInterface {
    getAllDonations(): Promise<Array<Donation>>;
    submitDonation(name: string, phone: string, amount: string, note: string, screenshot: string): Promise<void>;
    clearAllDonations(): Promise<void>;
    deleteDonationById(id: bigint): Promise<void>;
    submitMemberApplication(name: string, phone: string, address: string, occupation: string, photo: string): Promise<bigint>;
    getAllMemberApplications(): Promise<Array<MemberApplication>>;
    approveMemberApplication(id: bigint): Promise<void>;
    deleteMemberApplication(id: bigint): Promise<void>;
}
