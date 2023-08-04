import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { hireId: string } }
) {
  try {
    if (!params.hireId) {
      return new NextResponse("Hire ID is required", { status: 400 });
    }

    const productHire = await prismadb.productHire.findUnique({
      where: {
        id: params.hireId,
      },
    });

    return NextResponse.json(productHire);
  } catch (error) {
    console.log("[HIRE_PRODUCT_GET", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; hireId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.hireId) {
      return new NextResponse("Hire ID is required", { status: 400 });
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

    const productHire = await prismadb.productHire.deleteMany({
      where: {
        id: params.hireId,
      },
    });

    return NextResponse.json(productHire);
  } catch (error) {
    console.log("[HIRE_PRODUCT_DELETE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
