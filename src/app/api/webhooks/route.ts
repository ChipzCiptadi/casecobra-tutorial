import { db } from "@/db";
import { headers } from "next/headers";
import stripe from "stripe";
import { error as errorLog } from "@/lib/logger";

const POST = async (req: Request) => {
  try {
    const body = await req.text();

    const signature = headers().get("stripe-signature");
    if (!signature) {
      return new Response("invalid signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type !== "checkout.session.completed") {
      return Response.json(
        { message: "Payment not made", ok: false },
        { status: 400 }
      );
    }

    if (!event.data.object.customer_details?.email) {
      throw new Error("Missing user email");
    }

    const session = event.data.object as stripe.Checkout.Session;

    const { userId, orderId } = session.metadata || {
      userId: null,
      orderId: null,
    };

    if (!userId || !orderId) {
      throw new Error("Invalid request metadata");
    }

    const billingAddress = session.customer_details!.address;
    const shippingAddress = session.shipping_details!.address;

    await db.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        status: "awaiting_shipment",
        shippingAddress: {
          create: {
            name: session.customer_details!.name!,
            city: shippingAddress!.city!,
            country: shippingAddress!.country!,
            postalCode: shippingAddress!.postal_code!,
            street: shippingAddress!.line1!,
            state: shippingAddress!.state,
          },
        },
        billingAddress: {
          create: {
            name: session.customer_details!.name!,
            city: billingAddress!.city!,
            country: billingAddress!.country!,
            postalCode: billingAddress!.postal_code!,
            street: billingAddress!.line1!,
            state: billingAddress!.state,
          },
        },
      },
    });

    return Response.json({ result: event, ok: true });
  } catch (error) {
    errorLog(error);

    return Response.json(
      { message: "Something went wrong", ok: false },
      { status: 500 }
    );
  }
};

export { POST };
