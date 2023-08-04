"use client";

import { ColumnDef } from "@tanstack/react-table";

export type HireColumn = {
  id: string;
  product: string;
  // createdAt: string;
  hireDate: string;
  isPaid: string;
};

export const columns: ColumnDef<HireColumn>[] = [
  {
    accessorKey: "product",
    header: "Product",
  },
  {
    accessorKey: "hireDate",
    header: "Hire Date",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
];
