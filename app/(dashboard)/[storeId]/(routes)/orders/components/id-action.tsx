"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { FileText, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface IdActionProps {
  data: OrderColumn;
}

export const IdAction: React.FC<IdActionProps> = ({ data }) => {

  const { toast } = useToast();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      variant: "default",
      title: "Success!",
      description: "Order ID copied to the clipboard.",
    });
  };

 

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Order Id</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <FileText className="mr-2 h-4 w-4" />
            {data.id}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
