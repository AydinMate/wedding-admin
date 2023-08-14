import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PickUpEmail } from "@/emails/PickUpEmail";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const formatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;
  const customerName = session?.customer_details?.name;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];

  const addressString = addressComponents.filter((c) => c !== null).join(", ");

  if (event.type === "checkout.session.completed") {
    console.log("Session", session);

    const orderId = session?.metadata?.orderId;

    // Update the order
    const order = await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || "",
        customerName: customerName || "",
      },
      include: {
        orderItems: true,
      },
    });

    // Update the ProductHire
    const productHire = await prismadb.productHire.updateMany({
      where: {
        orderId: orderId,
      },
      data: {
        isPaid: true,
      },
    });

    const productIds = order.orderItems.map((item) => item.productId);

    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        colour: true,
        size: true,
        price: true,
        images: true
      },
    });

    const formattedProducts = products.map(product => ({
      ...product,
      colour: product.colour.name,
      size: product.size.name,
      price: Number(product.price),
      images: product.images[0].url,
    }));
    

    const formattedHireDate = formatter.format(order.hireDate);

    if (!order.isDelivery) {
      const pickUpEmail = await resend.emails.send({
        from: "bu@resend.dev",
        to: session?.customer_details?.email || "",
        subject: "Receipt for Your Payment",
        react: PickUpEmail({
          hireDate: formattedHireDate,
          orderId: orderId,
          city: session?.customer_details?.address?.city,
          country: session?.customer_details?.address?.country,
          customerName: session?.customer_details?.name,
          line1: session?.customer_details?.address?.line1,
          postalCode: session?.customer_details?.address?.postal_code,
          state: session?.customer_details?.address?.state,
          products: formattedProducts
        }),
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}

// console log: Session meta data:  { orderId: 'd867e4d1-201d-41c5-baaa-f311fe3a5665' }

// link the order id to the product hire in db. link is paid to orderId.isPaid Find every product with that order id, and make the

// const productIds = order.orderItems.map((orderItem) => orderItem.productId);

// await prismadb.product.updateMany({
//   where: {
//     id: {
//       in: [...productIds],
//     },
//   },
//   data: {
//     isArchived: true
//   }
// });
