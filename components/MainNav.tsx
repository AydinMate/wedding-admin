"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/${params.storeId}`,
      label: "Overview",
      active: pathname === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: "Billboards",
      active: pathname.startsWith(`/${params.storeId}/billboards`),
    },
    {
      href: `/${params.storeId}/categories`,
      label: "Categories",
      active: pathname.startsWith(`/${params.storeId}/categories`),
    },
    {
      href: `/${params.storeId}/sizes`,
      label: "Sizes",
      active: pathname.startsWith(`/${params.storeId}/sizes`),
    },
    {
      href: `/${params.storeId}/colours`,
      label: "Colours",
      active: pathname.startsWith(`/${params.storeId}/colours`),
    },
    {
      href: `/${params.storeId}/products`,
      label: "Products",
      active: pathname.startsWith(`/${params.storeId}/products`),
    },
    {
      href: `/${params.storeId}/hires`,
      label: "Hires",
      active: pathname.startsWith(`/${params.storeId}/hires`),
    },
    {
      href: `/${params.storeId}/orders`,
      label: "Orders",
      active: pathname.startsWith(`/${params.storeId}/orders`),
    },
    {
      href: `/${params.storeId}/settings`,
      label: "Settings",
      active: pathname.startsWith(`/${params.storeId}/settings`),
    },
  ];
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colours hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
