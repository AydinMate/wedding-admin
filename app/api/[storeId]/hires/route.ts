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

    const { productId, hireDate, isPaid, orderId, isCash } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }
    if (!hireDate) {
      return new NextResponse("Hire Date is required", { status: 400 });
    }
    if (typeof isPaid !== "boolean") {
      return new NextResponse("Is Paid must be a boolean value", {
        status: 400,
      });
    }

    if (typeof isCash !== "boolean") {
      return new NextResponse("Is Cash must be a boolean value", {
        status: 400,
      });
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

    const productHire = await prismadb.productHire.create({
      data: {
        productId,
        hireDate,
        isPaid,
        isCash,
        storeId: params.storeId,
        orderId,
      },
    });

    // Create a new response with the productHire data
    const res = NextResponse.json(productHire);

    // Add the CORS headers to the response
    res.headers.set(
      "Access-Control-Allow-Origin",
      process.env.FRONTEND_STORE_URL!
    );
    res.headers.set("Access-Control-Allow-Methods", "GET,POST");
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return res;
  } catch (error) {
    console.log("[HIRES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isPaid = searchParams.get("isPaid") === "true";
    const isCash = searchParams.get("isCash") === "true";

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const productHires = await prismadb.productHire.findMany({
      where: {
        storeId: params.storeId,
        ...(startDate &&
          endDate && {
            hireDate: { gte: new Date(startDate), lte: new Date(endDate) },
          }), // Include hireDate in the where clause if both startDate and endDate are provided
        ...(isPaid && { isPaid }), // Include isPaid in the where clause if it's true
        ...(isCash && { isCash }), // Include isCash in the where clause if it's true
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Create a new response with the productHires data
    const res = NextResponse.json(productHires);

    // Add the CORS headers to the response
    res.headers.set(
      "Access-Control-Allow-Origin",
      process.env.FRONTEND_STORE_URL!
    );
    res.headers.set("Access-Control-Allow-Methods", "GET,POST");
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return res;
  } catch (error) {
    console.log("[PRODUCT_HIRES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
