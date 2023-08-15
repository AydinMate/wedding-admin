import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/columns";
import { formatter } from "@/lib/utils";


const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    products: item.orderItems
      .map((orderItem) => orderItem.product.name)
      .join(", "),
    isPaid: item.isPaid ? "Paid" : "Not Paid",
    isCash: item.isCash ? "Cash" : "Not Cash",
    createdAt: format(item.createdAt, "MMM do, yyyy"),
    dropoffAddress: item.dropoffAddress,
    hireDate: format(item.hireDate, 'EEE MMM dd yyyy'),
    isDelivery: item.isDelivery ? "Delivery" : "Pickup",
    customerName: item.customerName,
    totalPrice: formatter.format(item.price.toNumber()),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
