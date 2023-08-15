import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

interface ProductHire {
  productId: string;
  hireDate: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const body = await req.json();

  const { productHires, dropoffAddress, isDelivery, hireDate } = body;

  if (!productHires || productHires.length === 0) {
    return new NextResponse("Product hires are required", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productHires.map(
          (productHire: ProductHire) => productHire.productId
        ),
      },
    },
  });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach((product) => {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "AUD",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price.toNumber() * 100,
      },
    });
  });

  const orderPrice = products
  .map((product) => product.price.toNumber())
  .reduce((acc, curr) => acc + curr, 0);


  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      hireDate: new Date(body.hireDate), // assign hireDate to order here
      dropoffAddress: body.dropoffAddress,
      isDelivery: body.isDelivery,
      price: orderPrice,
      orderItems: {
        create: body.productHires.map((productHire: ProductHire) => ({
          product: { connect: { id: productHire.productId } },
        })),
      },
    },
  });

  await Promise.all(
    body.productHires.map((productHire: ProductHire) =>
      prismadb.productHire.create({
        data: {
          productId: productHire.productId,
          storeId: params.storeId,
          hireDate: new Date(productHire.hireDate),
          orderId: order.id,
        },
      })
    )
  );

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id,
    },
  });

  return NextResponse.json(
    { url: session.url },
    {
      headers: corsHeaders,
    }
  );
}
