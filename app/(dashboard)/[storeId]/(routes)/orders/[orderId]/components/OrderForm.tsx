"use client";

import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Order } from "@prisma/client";
import { CalendarIcon, GemIcon, Trash } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  orderId: z.string().min(1).max(64, "Maximum length is 64 characters"),
  isDelivery: z.boolean(),
  isPaid: z.boolean(),
  orderItems: z.any(),
  dropoffAddress: z.string().max(64, "Maximum length is 64 characters"),

  hireDate: z.date({
    required_error: "A hire date is required.",
  }),
});

type OrderFormValues = z.infer<typeof formSchema>;

interface Product {
  id: string;
name: string
}

interface OrderFormProps {
  initialData: Order | null;
  products: Product[];
}

export const OrderForm: React.FC<OrderFormProps> = ({
  initialData,
  products,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<Product[]>([]);

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
        }
      : {
          hireDate: new Date(),
          isDelivery: false,
          isPaid: false,
          orderId: "",
          orderItems: orderItems,
          dropoffAddress: "",
        },
  });

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
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
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
                            onSelect={field.onChange}
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
                      disabled={loading}
                      placeholder="123 Fake st"
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
          <SelectItem value="false">Pickup</SelectItem>
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
                    onValueChange={field.onChange}
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
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span>Pick products</span>

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
                                  {products.map((product) => (
                                
                                      <CommandItem key={product.id}>
                                        <Checkbox />
                                        <div
                                          className="text-sm ml-2"
                                          
                                        >
                                          {product.name}
                                        </div>
                                      </CommandItem>
                            
                                  ))}
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
            </div>
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
