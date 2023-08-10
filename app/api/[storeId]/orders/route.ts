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

    const { productId, isPaid, orderId, hireDate, address, dropoffAddress } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }
    if (!isPaid) {
      return new NextResponse("Is Paid is required", { status: 400 });
    }

    if (!orderId) {
      return new NextResponse("Order Id is required", { status: 400 });
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
        isPaid,
        storeId: params.storeId,
        hireDate,
        address,
        dropoffAddress,

      },
    });

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


