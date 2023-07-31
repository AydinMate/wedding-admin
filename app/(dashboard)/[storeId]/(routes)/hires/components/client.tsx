"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { HireColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface HireClientProps {
  data: HireColumn[];
}

export const HireClient: React.FC<HireClientProps> = ({ data }) => {
  return (
    <>
      <Heading
        title={`Hires (${data.length})`}
        description="Manage hires for your store"
      />
      <Separator />
      <DataTable columns={columns} data={data} searchKey="products" />
    </>
  );
};
