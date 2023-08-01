import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  const body = await req.text();
  console.log('Received body:', body);  // <-- Log the incoming request body

  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Error constructing Stripe event:', error);  // <-- Log any errors when constructing Stripe event
    return new NextResponse(`Webhook error: ${error.message}`, { status: 400 });
  }

  console.log('Stripe event:', event);  // <-- Log the Stripe event

  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;

  const addressComonents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];

  const addressString = addressComonents.filter((c) => c !== null).join(", ");

  console.log('Address:', addressString);  // <-- Log the constructed address

  if (event.type === "checkout.session.completed") {
    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || "",
      },
      include: {
        orderItems: true,
      },
    });

    console.log('Order:', order);  // <-- Log the updated order

    const productIds = order.orderItems.map((orderItem) => orderItem.productId);
    console.log('Product IDs:', productIds);  // <-- Log the product IDs

    await prismadb.product.updateMany({
      where: {
        id: {
          in: [...productIds],
        },
      },
      data: {
        isArchived: true,
      },
    });
  }
  return new NextResponse(null, { status: 200 });
}

