import prismadb from "@/lib/prismadb";

export const getProducts = async (orderId: string) => {
  // Fetch the productIds associated with the given orderId
  const orderItems = await prismadb.orderItem.findMany({
    where: {
      orderId,
    },
    select: {
      productId: true
    }
  });

  // Extract productIds from orderItems
  const productIds = orderItems.map(item => item.productId);

  // Fetch products matching the extracted productIds
  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds
      }
    },
    select: {
      id: true,
      storeId: true,
      categoryId: true,
      name: true,
      sizeId: true,
      colourId: true,
    }
  });

  return products;
};
