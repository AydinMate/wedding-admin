"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { HireColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

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
      <DataTable placeholder="Enter Hire Date..." columns={columns} data={data} searchKey="hireDate" />
      <Heading title="API" description="API calls for Hires" />
      <Separator />
      <ApiList entityIdName="hireId" entityName="hires" />
    </>
  );
};
