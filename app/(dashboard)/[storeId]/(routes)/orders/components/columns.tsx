"use client";

import { ColumnDef } from "@tanstack/react-table";

export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  isPaid: string;
  totalPrice: string;
  isDelivery: string;
  dropoffAddress: string;
  hireDate: string;
  products: string;
  createdAt: string;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "isDelivery",
    header: "Delivery/Pick Up",
  },
  {
    accessorKey: "dropoffAddress",
    header: "Delivery Address",
  },
  {
    accessorKey: "hireDate",
    header: "Hire Date",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Billing Address",
  },
];
