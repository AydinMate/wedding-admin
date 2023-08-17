import prismadb from "@/lib/prismadb";
import { getProducts } from "./getProducts";

export const getThisWeeksOrders = async (storeId: string) => {
  // Get the current date in UTC
  const currentDate = new Date();

  // Calculate the previous Monday
  const startOfWeek = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - currentDate.getUTCDay() + (currentDate.getUTCDay() === 0 ? -6 : 1)));

  // Calculate the next Sunday
  const endOfWeek = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - currentDate.getUTCDay() + 7));

  const orders = await prismadb.order.findMany({
    where: {
      storeId,
      hireDate: {
        gte: startOfWeek,
        lt: endOfWeek
      },
      OR: [
        { isPaid: true },
        { isCash: true }
      ]
    },
    select: {
      id: true,
      storeId: true,
      isPaid: true,
      isCash: true,
      hireDate: true,
      dropoffAddress: true,
      isDelivery: true,
      customerName: true,
    },
    orderBy: {
      hireDate: 'asc' // 'asc' for ascending order
    }
  });

  // Fetch products for each order and embed them within the order object
  const thisWeeksOrders = await Promise.all(orders.map(async order => {
    const products = await getProducts(order.id);
    return {
      ...order,
      products
    };
  }));
  return thisWeeksOrders;
};
