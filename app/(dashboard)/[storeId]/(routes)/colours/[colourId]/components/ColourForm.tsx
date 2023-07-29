"use client";

import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Colour } from "@prisma/client";
import { ExternalLink, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1).max(64, "Maximum length is 64 characters"),
  value: z.string().min(4).regex(/^#/, {
    message: "String must be a valid hex code",
  }),
});

type ColourFormValues = z.infer<typeof formSchema>;

interface ColourFormProps {
  initialData: Colour | null;
}

export const ColourForm: React.FC<ColourFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const title = initialData ? "Edit Colour" : "Create Colour";
  const description = initialData ? "Edit a colour" : "Add a new colour";
  const toastMessage = initialData ? "Colour updated." : "Colour created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ColourFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });

  const onSubmit = async (data: ColourFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/colours/${params.colourId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/colours`, data);
      }

      router.refresh();
      router.push(`/${params.storeId}/colours`);
      toast({
        variant: "default",
        title: "Awesome!",
        description: toastMessage,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh.",
        description: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/colours/${params.colourId}`);
      router.refresh();
      router.push(`/${params.storeId}/colours`);
      toast({
        variant: "default",
        title: "Success!",
        description: "Colour deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh.",
        description:
          "Make sure you removed all products using this colour first.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onCancel = () => {
    setLoading(true);
    router.refresh();
    router.push(`/${params.storeId}/colours`);
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
            color={"icon"}
            size="icon"
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
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      disabled={loading}
                      placeholder="Colour name"
                      maxLength={64}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-x-4">
                      <Input
                        autoComplete="off"
                        disabled={loading}
                        placeholder="#ffffff"
                        maxLength={64}
                        {...field}
                      />
                      <div
                        className="border p-4 rounded-full"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
      <Separator />
      <div className="mt-2">
        <Link
          href={"https://htmlcolorcodes.com/color-picker/"}
          target="_blank"
        >
          <Button variant={"link"}>
            Colour Picker <ExternalLink className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </>
  );
};
