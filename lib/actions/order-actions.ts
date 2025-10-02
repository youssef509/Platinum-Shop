'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "../generated/prisma/client";

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

// Create new PayPal order
export async function createPayPalOrder(orderId: string) {
    try {
        // Get order from the database
        const order = await prisma.order.findFirst({
            where: { id: orderId },
        });
        if (order) {
            // Create PayPal order
            const paypalOrder = await paypal.createOrder(Number(order.totalPrice));
            // Update order with PayPal order ID
            await prisma.order.update({
                where: { id: orderId },
                data: { 
                    paymentResult: {
                        id: paypalOrder.id,
                        email_address: "",
                        status: "",
                        pricePaid: 0
                    } 
                }
            });
            return {success: true, message: "PayPal order created", data: paypalOrder.id};
        } else {
            throw new Error("Order not found");
        }
    } catch (error) {
        return {success: false, message: formatError(error)};
    }
}

// Approve PayPal order and update order to paid status
export async function approvePayPalOrder(orderId: string, data:{orderId: string}) {
    try {
        // Get the order from the database
        const order = await prisma.order.findFirst({
            where: { id: orderId },
        });
        if (!order) throw new Error("Order not found");

        const captureData = await paypal.capturePayment(data.orderId)

        if (!captureData || captureData.id !== (order.paymentResult as PaymentResult)?.id || captureData.status !== "COMPLETED") {
            return {success: false, message: "PayPal order not approved"};
        }

        // Update order to paid status
        await updateOrderToPaid({ orderId, 
            paymentResult: {
                id: captureData.id,
                email_address: captureData.payer.email_address,
                status: captureData.status,
                pricePaid: captureData.purchase_units[0]?.payments.captures[0]?.amount?.value
            }
        });

        // Revalidate the order page to reflect the paid status
        revalidatePath(`/order/${orderId}`);

        return {success: true, message: "Your order is paid successfully."};
    } catch (error) {
        return {success: false, message: formatError(error)};
    }
}

// Update order to paid
async function updateOrderToPaid({
    orderId,
    paymentResult
}: { 
    orderId: string; 
    paymentResult?: PaymentResult
}) { 
    // Get the order from the database
    const order = await prisma.order.findFirst({
        where: { id: orderId },
        include: { orderitems: true }
    });
    if (!order) throw new Error("Order not found");

    if (order.isPaid) throw new Error("Order is already paid");

    // Transaction to update order and product stock
    await prisma.$transaction(async (tx) => { 
        // Iterate over products and update stock
        for (const item of order.orderitems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: -item.qty } }
            });
        }

        // Set order to paid
        await tx.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                paidAt: new Date(),
                paymentResult
            }
        });
    });

    // Get the updated order after the transaction
    const updatedOrder = await prisma.order.findFirst({
        where: { id: orderId },
        include: { 
            orderitems: true,
            user: { select: { name: true, email: true } }
        }
    });

    if (!updatedOrder) throw new Error("Failed to retrieve updated order");
}

// Get the users orders
export async function getMyOrders({limit = PAGE_SIZE, page,}: { limit?: number; page: number; }) {
    const session = await auth();
    if (!session) throw new Error("User not authenticated");
    if (!session.user || !session.user.id) {
        throw new Error("User ID not found in session");
    }
    const data = await prisma.order.findMany({
        where: { userId: session.user.id },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" }
    });

    const dataCount = await prisma.order.count({ where: { userId: session.user.id } });

    return { 
        data,
        totalPages: Math.ceil(dataCount / limit), 
    };

}

type salesDataType = { 
    month: string; 
    totalSales: number 
};

// Get sales data and order summary
export async function getOrderSummary() {
    
    // Get counts for each resource
    const ordersCount = await prisma.order.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();

    // Calculate the total sales
    const totalSales = await prisma.order.aggregate({
        _sum: { totalPrice: true },
    });
    const totalSalesAmount = totalSales._sum.totalPrice || 0;

    // Get monthly sales
    const salesDataRaw = await prisma.$queryRaw<Array<{ month: string; totalSales: Prisma.Decimal}>>
    `SELECT 
        TO_CHAR("createdAt", 'MM/YY') AS "month", 
        SUM("totalPrice") AS "totalSales" 
    FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`
    ;
    const salesData: salesDataType[] = salesDataRaw.map((entry) => ({ month: entry.month, totalSales: Number(entry.totalSales) }));

    // get latest sales
    const latestSales = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { name: true } } }
    });

    return { 
        ordersCount, 
        productsCount,
        usersCount,
        totalSalesAmount,
        salesData,
        latestSales
    };

}

// Get all orders for admin
export async function getAllOrders({limit = PAGE_SIZE, page,}: { limit?: number; page: number; }) {
    const session = await auth();
    if (!session) throw new Error("User not authenticated");
    if (!session.user || !session.user.id) {
        throw new Error("User ID not found in session");
    }
    const data = await prisma.order.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } }
    });

    const dataCount = await prisma.order.count();

    return {
        data,
        totalPages: Math.ceil(dataCount / limit),
    };
}
