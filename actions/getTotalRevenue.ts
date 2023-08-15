import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
  
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      OR: [
        { isPaid: true },
        { isCash: true }
      ]
    },
  });

  const totalRevenue = paidOrders.reduce((acc, order) => acc + order.price.toNumber(), 0);

  return totalRevenue;
};

