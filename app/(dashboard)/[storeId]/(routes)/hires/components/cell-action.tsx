"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HireColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { AlertModel } from "@/components/modals/alert-modal";

interface CellActionProps {
  data: HireColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const onCopyHire = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      variant: "default",
      title: "Success!",
      description: "Hire ID copied to the clipboard.",
    });
  };

  const onCopyOrder = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      variant: "default",
      title: "Success!",
      description: "Order ID copied to the clipboard.",
    });
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/hires/${data.id}`);
      router.refresh();
      toast({
        variant: "default",
        title: "Success!",
        description: "Hire deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh.",
        description: "Something went wrong.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  return (
    <>
      <AlertModel
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopyHire(data.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Hire ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onCopyOrder(data.orderId)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Order ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
