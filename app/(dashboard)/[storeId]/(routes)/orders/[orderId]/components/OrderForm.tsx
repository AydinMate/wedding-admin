"use client";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, GemIcon, Plus, Trash, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModel } from "@/components/modals/alert-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  orderId: z.any(),
  isDelivery: z.any(),
  isPaid: z.any(),
  isCash: z.any(),
  orderItems: z.any(),
  dropoffAddress: z.string().max(64, "Maximum length is 64 characters"),
  customerName: z.string().max(64, "Maximum length is 64 characters"),

  hireDate: z.date({
    required_error: "A hire date is required.",
  }),
});

type OrderFormValues = z.infer<typeof formSchema>;

interface Product {
  id: string;
  name: string;
}

interface OrderItem {
  productId: string;
  orderId: string;
  id: string;
}

interface ProductHire {
  productId: string;
  hireDate: Date;
  isPaid: boolean;
  isCash: boolean;
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
}

interface OrderFormProps {
  initialData: Order | null;
  products: Product[];
  orderItemsData: OrderItem[];
  productHires: ProductHire[];
}

export const OrderForm: React.FC<OrderFormProps> = ({
  initialData,
  products,
  orderItemsData,
  productHires,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(orderItemsData);

  const { toast } = useToast();

  const title = initialData ? "Edit Order" : "Create Order";
  const description = initialData ? "Edit a order" : "Add a new order";
  const toastMessage = initialData ? "Order updated." : "Order created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          orderItems: JSON.stringify(orderItemsData),
        }
      : {
          hireDate: new Date(),
          isDelivery: true,
          isPaid: false,
          isCash: true,
          orderId: "",
          orderItems: JSON.stringify(orderItems),
          dropoffAddress: "",
          customerName: "",
        },
  });

  const { setValue, watch } = form;

  const hireDate = watch("hireDate");

  const isProductHiredOnSelectedDate = (productId: string) => {
    if (!hireDate) return false;

    // Create the start and end of the selected date in UTC
    const selectedDateStart = new Date(
      Date.UTC(
        hireDate.getUTCFullYear(),
        hireDate.getUTCMonth(),
        hireDate.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    const selectedDateEnd = new Date(
      Date.UTC(
        hireDate.getUTCFullYear(),
        hireDate.getUTCMonth(),
        hireDate.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    return productHires.some((productHire) => {
      const productHireDate = new Date(productHire.hireDate);
      return (
        productHire.productId === productId &&
        productHireDate >= selectedDateStart &&
        productHireDate <= selectedDateEnd
      );
    });
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/orders/${params.orderId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/orders`, data);
      }

      router.refresh();
      router.push(`/${params.storeId}/orders`);
      toast({
        variant: "default",
        title: "Awesome!",
        description: toastMessage,
      });
    } catch (error) {
      console.error("Error occurred:", error); // 4. Log any errors
      toast({
        variant: "destructive",
        title: "Uh oh.",
        description:
          "Something went wrong. Please make sure all fields are filled",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/orders/${params.orderId}`);
      router.refresh();
      router.push(`/${params.storeId}/orders`);
      toast({
        variant: "default",
        title: "Success!",
        description: "Order deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh.",
        description: "Make sure you removed all hires using this order first.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onCancel = () => {
    setLoading(true);
    router.refresh();
    router.push(`/${params.storeId}/orders`);
    setLoading(false);
  };

  const addOrderItem = (product: Product) => {
    const orderId = Array.isArray(params.orderId)
      ? params.orderId[0]
      : params.orderId;

    const newItem = {
      id: uuidv4(),
      orderId: orderId,
      productId: product.id,
    };

    const updatedOrderItems = [...orderItems, newItem];
    setOrderItems(updatedOrderItems);
    setValue("orderItems", JSON.stringify(updatedOrderItems)); // Update the form's internal state
  };

  const removeOrderItem = (itemId: string) => {
    const updatedOrderItems = orderItems.filter((oi) => oi.id !== itemId);
    setOrderItems(updatedOrderItems);
    setValue("orderItems", JSON.stringify(updatedOrderItems)); // Update the form's internal state
  };

  return (
    <>
      <AlertModel
        isOpen={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant={"destructive"}
            size={"icon"}
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="hireDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hire Date</FormLabel>
                  <div>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={loading}
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(
                                  new Date(
                                    Date.UTC(
                                      field.value.getFullYear(),
                                      field.value.getMonth(),
                                      field.value.getDate()
                                    )
                                  ),
                                  "PPP"
                                )
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(selectedDate) => {
                              if (selectedDate) {
                                // Convert the selected date to UTC
                                const utcDate = new Date(
                                  Date.UTC(
                                    selectedDate.getFullYear(),
                                    selectedDate.getMonth(),
                                    selectedDate.getDate()
                                  )
                                );
                                field.onChange(utcDate);
                                setOrderItems([]);
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dropoffAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery address</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      disabled={loading}
                      placeholder="Enter an address..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDelivery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is it a pick up or delivery?</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => {
                      // Convert the string value back to boolean and call field.onChange
                      field.onChange(value === "true");
                    }}
                    value={field.value ? "true" : "false"}
                    defaultValue={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value ? "true" : "false"}
                          placeholder="Select an option"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Delivery</SelectItem>
                      <SelectItem value="false">Pick up</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Has the order been paid for?</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => {
                      // Convert the string value back to boolean and call field.onChange
                      field.onChange(value === "true");
                    }}
                    value={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Paid</SelectItem>
                      <SelectItem value="false">Not Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products</FormLabel>
                  <div>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={loading}
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span>Add products</span>

                              <GemIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search products..." />
                            <CommandEmpty>No products found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-72 w-full rounded-md border">
                                <div className="p-4">
                                  {products.map((product) => {
                                    const matchingItem = orderItems.find(
                                      (item) => item.productId === product.id
                                    );

                                    return (
                                      <CommandItem
                                        className="flex items-center"
                                        key={product.id}
                                      >
                                        {!matchingItem ? (
                                          <Button
                                            disabled={isProductHiredOnSelectedDate(
                                              product.id
                                            )}
                                            onClick={() =>
                                              addOrderItem(product)
                                            }
                                            className="mr-2"
                                            size={"icon"}
                                            variant={"secondary"}
                                          >
                                            <Plus className="w-4 h-4" />
                                          </Button>
                                        ) : (
                                          <Button
                                            onClick={() =>
                                              removeOrderItem(matchingItem.id)
                                            }
                                            className="mr-2"
                                            size={"icon"}
                                            variant={"destructive"}
                                          >
                                            <X className="w-4 h-4" />
                                          </Button>
                                        )}
                                        <div className="text-sm ml-2">
                                          {product.name}
                                        </div>
                                      </CommandItem>
                                    );
                                  })}
                                </div>
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label>Selected Products</Label>
              {orderItems.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <div className="" key={item.id}>
                    <div className="flex items-center mt-2">
                      <Button
                        disabled={loading}
                        onClick={() => removeOrderItem(item.id)}
                        variant={"ghost"}
                        size={"icon"}
                        className="w-5 h-5"
                      >
                        {<X />}
                      </Button>
                      <p className="text-sm ml-2">
                        {product ? product.name : "No products selected"}
                      </p>
                    </div>
                    <Separator />
                  </div>
                );
              })}
            </div>
            <FormField
              control={form.control}
              name="isCash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is this a cash order?</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => {
                      // Convert the string value back to boolean and call field.onChange
                      field.onChange(value === "true");
                    }}
                    value={field.value ? "true" : "false"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Cash</SelectItem>
                      <SelectItem value="false">Not Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      disabled={loading}
                      placeholder="Enter a name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input
              type="hidden"
              name="orderItems"
              value={JSON.stringify(orderItems)}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
          <Button
            disabled={loading}
            onClick={onCancel}
            type="button"
            variant={"secondary"}
            className="ml-5"
          >
            Cancel
          </Button>
        </form>
      </Form>
    </>
  );
};
