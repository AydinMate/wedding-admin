"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronsUpDown, Copy, Navigation, NavigationOff } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import NoHires from "./NoHires";

interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  sizeId: string;
  colourId: string;
}

interface Order {
  id: string;
  storeId: string;
  isPaid: boolean;
  isCash: boolean;
  hireDate: Date;
  dropoffAddress: string;
  isDelivery: boolean;
  customerName: string;
  products: Product[];
}

interface OrderCardsProps {
  orders: Order[];
}
const OrderCards: React.FC<OrderCardsProps> = ({ orders }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  

  const onCopyOrder = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      variant: "default",
      title: "Success!",
      description: "Order ID copied to the clipboard.",
    });
  };

  if (orders.length === 0) {
    return <NoHires />
  }

  return (
    <div className="grid grid-cols-4">
      {orders.map((order) => (
        <div
          className="m-4 p-4 border-solid border-2  rounded-lg "
          key={order.id}
        >
          <div className="flex justify-between mb-2">
            <Label className="font-bold text-lg underline">
              {order.customerName !== "" ? order.customerName : "John Doe"}
            </Label>
            {order.isDelivery ? (
              <Popover>
                <PopoverTrigger>
                  <Badge className="bg-teal-600 hover:bg-teal-500 w-[6rem] flex justify-between">
                    {"Delivery"} <Navigation className="w-4 h-4" />
                  </Badge>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="flex flex-col">
                    <Label className="mb-2 font-bold">Address:</Label>
                    <Label>{order.dropoffAddress}</Label>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Badge
                variant={"secondary"}
                className="hover:cursor-default w-[6rem] flex justify-between"
              >
                {"Pick Up"} <NavigationOff className="w-4 h-4" />
              </Badge>
            )}
          </div>
          <div className="mb-2">
            <Label className="mr-2">Hire Date: </Label>
            <Label className="font-bold">
              {format(order.hireDate, "EEE MMM dd yyyy")}
            </Label>
          </div>
          <div className="flex justify-between items-center">
            <Popover>
              <PopoverTrigger>
                <Button
                  className="w-[8rem] justify-between"
                  variant={"outline"}
                >
                  Products{" "}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col space-y-4">
                  {order.products?.map((product) => (
                    <Label key={product.id}>&bull; {product.name}</Label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex space-x-4 items-center">
              {order.isPaid && order.isCash && (
                <Badge className="h-[1.5rem] hover:cursor-default" variant={"destructive"}>Check Settings</Badge>
              )}
              {order.isPaid && !order.isCash && (
                <Badge className="bg-green-600 hover:bg-green-500 hover:cursor-default h-[1.5rem]">
                  Paid
                </Badge>
              )}
              {!order.isPaid && order.isCash && (
                <Badge className="bg-orange-600 hover:bg-orange-500 hover:cursor-default h-[1.5rem]">
                  Cash
                </Badge>
              )}
              <div>
                <Button onClick={() => onCopyOrder(order.id)} className="px-3 py-0" variant={"outline"}>
                  <Copy className="w-4 h-4"/>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderCards;
