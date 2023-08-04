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

    const { productId, hireDate, isPaid } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }
    if (!hireDate) {
      return new NextResponse("Hire Date is required", { status: 400 });
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

    const productHire = await prismadb.productHire.create({
      data: {
        productId,
        hireDate,
        isPaid,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(productHire);
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
    const hireDate = searchParams.get("hireDate");
    const isPaid = searchParams.get("isPaid");

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const productHires = await prismadb.productHire.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(productHires);
  } catch (error) {
    console.log("[PRODUCT_HIRES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
