import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
}

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    if (!params.orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    const order = await prismadb.order.findUnique({
      where: {
        id: params.orderId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_GET", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();


    // Ensure isPaid and isDelivery are booleans
    const isPaidBool = body.isPaid === true || body.isPaid === "true";
    const isDeliveryBool =
      body.isDelivery === true || body.isDelivery === "true";
    const isCashBool = body.isCash === true || body.isCash === "true";

    const { orderItems: orderItemsData, hireDate } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!orderItemsData) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
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

    // 1. Delete all OrderItem records associated with the Order
    await prismadb.orderItem.deleteMany({
      where: {
        orderId: params.orderId,
      },
    });

    await prismadb.productHire.deleteMany({
      where: {
        orderId: params.orderId,
      },
    });

    // 2. Create new OrderItem records based on the provided data
    const parsedOrderItems = JSON.parse(orderItemsData);
    for (const item of parsedOrderItems) {
      await prismadb.orderItem.create({
        data: {
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
        },
      });

      await prismadb.productHire.create({
        data: {
          orderId: item.orderId,
          storeId: params.storeId,
          hireDate: hireDate,
          isPaid: isPaidBool,
          isCash: isCashBool,
          productId: item.productId,
        },
      });
    }

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

    // 3. Update the Order with the other fields
    const order = await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        isPaid: isPaidBool,
        isDelivery: isDeliveryBool,
        isCash: isCashBool,
        hireDate,
        dropoffAddress: body.dropoffAddress,
        customerName: body.customerName,
        price: totalPrice
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("ORDER_PATCH", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
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

    const orderItem = await prismadb.orderItem.deleteMany({
      where: {
        orderId: params.orderId,
      },
    });

    const productHire = await prismadb.productHire.deleteMany({
      where: {
        orderId: params.orderId,
      },
    });

    const order = await prismadb.order.deleteMany({
      where: {
        id: params.orderId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_DELETE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
