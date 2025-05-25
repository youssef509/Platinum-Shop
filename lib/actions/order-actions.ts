'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";



// Create order and the order items
export async function createOrder() {
    try {
        const session = await auth();
        if (!session) throw new Error("User not authenticated");

        const cart = await getMyCart();
        const userId = session?.user?.id;
        if (!userId) throw new Error("User not found");

        const user = await getUserById(userId);

        if (!cart || cart.items.length === 0) {
            return {success: false, message: "Your cart is empty.", redirect: '/cart'};
        };
        if (!user.address) {
            return {success: false, message: "Please add a shipping address.", redirect: '/shipping-address'};
        };
        if (!user.paymentMethod) {
            return {success: false, message: "Please add a payment method.", redirect: '/payment-method'};
        };
        
        // Create order object
        const order = insertOrderSchema.parse({
            userId: user.id,
            items: cart.items,
            shippingAddress: user.address,
            paymentMethod: user.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
        });

        // Prepare data for Prisma (remove userId, add user relation)
        const { userId: orderUserId, ...orderData } = order;

        if (!orderUserId) throw new Error("Order userId is missing");

        // Create a transaction to create the order and order items in the database
        const insertedOrderId = await prisma.$transaction(async (tx) => {
            // Create the order
            const insertedOrder = await tx.order.create({
            data: {
                ...orderData,
                user: { connect: { id: orderUserId as string } },
            }
        });
          // Create the order items
          for (const item of cart.items as CartItem[]) {
            await tx.orderItem.create({
                data: {
                    ...item,
                    price: item.price,
                    orderId: insertedOrder.id, // Associate the order item with the created order
                }
            });
          }
          // Clear the cart after order creation
            await tx.cart.update({
                where: { id: cart.id },
                data: { items: [], itemsPrice: 0, shippingPrice: 0, taxPrice: 0, totalPrice: 0 }
            });

            return insertedOrder.id;
        });

        if (!insertedOrderId) throw new Error("Order creation failed");

        return {
            success: true, 
            message: "Order created successfully",
            redirect: `/order/${insertedOrderId}` // Redirect to the order details page
        };

    } catch (error) {
        if (isRedirectError(error)) throw error;
        return {success: false, message: formatError(error)};

    }
}

// Get order by ID
export async function getOrderById(orderId: string) {
    const data = await prisma.order.findFirst({
        where: { id: orderId },
        include: {
            orderitems: true, 
            user: {select: { name: true, email: true }},
        }
    });
    
    return convertToPlainObject(data);
}