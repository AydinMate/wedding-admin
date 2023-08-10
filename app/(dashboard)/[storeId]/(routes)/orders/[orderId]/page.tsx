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
  });

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
    select: {
     id: true,
     name: true
    }
  });

  
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderForm
          products={products}
          initialData={order}
        />
      </div>
    </div>
  );
};

export default OrderPage;
