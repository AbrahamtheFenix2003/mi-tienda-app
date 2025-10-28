// packages/types/src/supplier.ts

export interface Supplier {
  id: number;
  name: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
