"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { IdAction } from "./id-action";

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
    accessorKey: "id",
    header: "Order Id",
    cell: ({ row }) => <IdAction data={row.original} />,
  },
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
    accessorKey: "isCash",
    header: "Cash",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },

  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
