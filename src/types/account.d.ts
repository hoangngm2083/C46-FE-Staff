declare global {
  type Role = "ADMIN" | "DOCTOR" | "MANAGER" | "RECEPTIONIST";

  interface IAccount {
    accountId: number;
    accountName: string;
    role: Role;
    staffId: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
  }
}

export {};
