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
    id: bigint;
    name: string;
    note: string;
    timestamp: Time;
    phone: string;
    amount: string;
    screenshot: string;
}
export type Time = bigint;
export interface MemberApplication {
    id: bigint;
    occupation: string;
    status: string;
    paymentScreenshot: string;
    name: string;
    address: string;
    timestamp: Time;
    paymentDone: boolean;
    phone: string;
    photo: string;
}
export interface backendInterface {
    approveMemberApplication(id: bigint): Promise<void>;
    clearAllDonations(): Promise<void>;
    confirmMemberPayment(id: bigint): Promise<boolean>;
    deleteDonationById(id: bigint): Promise<void>;
    deleteMemberApplication(id: bigint): Promise<void>;
    getAllDonations(): Promise<Array<Donation>>;
    getAllMemberApplications(): Promise<Array<MemberApplication>>;
    getMemberByPhoneAndName(phone: string, name: string): Promise<MemberApplication | null>;
    submitDonation(name: string, phone: string, amount: string, note: string, screenshot: string): Promise<void>;
    submitMemberApplication(name: string, phone: string, address: string, occupation: string, photo: string): Promise<bigint>;
    submitPaymentProof(id: bigint, screenshot: string): Promise<boolean>;
}
