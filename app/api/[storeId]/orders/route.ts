import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { isPaid, hireDate, address, dropoffAddress, isDelivery, orderItems } =
      body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!isPaid) {
      return new NextResponse("Is Paid is required", { status: 400 });
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

    const order = await prismadb.order.create({
      data: {
        isPaid: isPaid,
        storeId: params.storeId,
        hireDate: hireDate,
        address: address,
        dropoffAddress: dropoffAddress,
        isDelivery: isDelivery,
      },
    });

    // Handle orderItems (similar to PATCH request)
    const parsedOrderItems = JSON.parse(orderItems);
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
