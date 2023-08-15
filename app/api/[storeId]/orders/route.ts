import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      isPaid,
      isCash,
      hireDate,
      address,
      dropoffAddress,
      isDelivery,
      orderItems,
      customerName
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (orderItems === "[]") {
      return new NextResponse("Order items are required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const parsedOrderItems = JSON.parse(orderItems);

    const productIds = parsedOrderItems.map(
      (item: OrderItem) => item.productId
    );

    // Find products using prismadb (assuming it returns a promise)
    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    // Calculate the total price
    const totalPrice = products
      .map((product) => product.price.toNumber()) // Convert Decimal to number if needed
      .reduce((acc, curr) => acc + curr, 0);

    const order = await prismadb.order.create({
      data: {
        isPaid: isPaid,
        isCash,
        storeId: params.storeId,
        hireDate: hireDate,
        address: address,
        dropoffAddress: dropoffAddress,
        isDelivery: isDelivery,
        customerName: customerName,
        price: totalPrice
      },
    });

    // Handle orderItems (similar to PATCH request)
    
    for (const item of parsedOrderItems) {
      await prismadb.orderItem.create({
        data: {
          id: item.id,
          orderId: order.id, // Use the created order's ID
          productId: item.productId,
        },
      });

      await prismadb.productHire.create({
        data: {
          orderId: order.id, // Use the created order's ID
          storeId: params.storeId,
          hireDate: hireDate,
          isPaid: isPaid,
          isCash: isCash,
          productId: item.productId,
        },
      });
    }

    const res = NextResponse.json(order);

    return res;
  } catch (error) {
    console.log("[ORDER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const res = NextResponse.json(orders);

    return res;
  } catch (error) {
    console.log("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
