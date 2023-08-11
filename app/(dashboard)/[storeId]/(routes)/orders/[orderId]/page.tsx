import prismadb from "@/lib/prismadb";
import { OrderForm } from "./components/OrderForm";

const OrderPage = async ({
  params,
}: {
  params: { orderId: string; storeId: string };
}) => {
  const order = await prismadb.order.findUnique({
    where: {
      id: params.orderId,
    },
    select: {
      id: true,
      storeId: true,
      isPaid: true,
      isCash: true,
      hireDate: true,
      dropoffAddress: true,
      isDelivery: true,
    },
  });

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const orderItems = await prismadb.orderItem.findMany({
    where: {
      orderId: params.orderId,
    },
    select: {
      productId: true,
      orderId: true,
      id: true,
    },
  });

  const productHires = await prismadb.productHire.findMany({
    where: {
      storeId: params.storeId,
    },
    select: {
      productId: true,
      hireDate: true,
      isPaid: true,
      isCash: true,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderForm
          products={products}
          orderItemsData={orderItems}
          initialData={order}
          productHires={productHires}
        />
      </div>
    </div>
  );
};

export default OrderPage;
