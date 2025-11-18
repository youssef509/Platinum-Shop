'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js"; 
import { createPayPalOrder, approvePayPalOrder, updateOrderToPaidCOD, deliverOrder  } from "@/lib/actions/order-actions";

const OrderDetailsTable = ({ order, paypalClientId, isAdmin } : { order: Order, paypalClientId: string, isAdmin: boolean }) => {
    const {
        shippingAddress,
        orderitems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        paymentMethod,
        isPaid,
        isDelivered,
        paidAt,
        deliveredAt,
    } = order;

    const { toast } = useToast();

    const PrintLoadingState = () => {
        const [{ isPending, isRejected }] = usePayPalScriptReducer();
        let status = "";
        if (isPending) {
            status = "pending";
        } else if (isRejected) {
            status = "Error in loading PayPal, Rejected";
        }
        return status;
    }

    const handleCreatePayPalOrder = async () => {
        const res = await createPayPalOrder(order.id);
        if (!res.success) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: res.message || 'Could not create PayPal order',
            });
        }
        return res.data;
    }

    const handleApprovePayPalOrder = async (data: { orderID: string; }) => {
        const res = await approvePayPalOrder(order.id, { orderId: data.orderID });

        toast({
            variant: res.success ? 'default' : 'destructive',
            title: res.success ? 'Success' : 'Error',
            description: res.message || (res.success ? 'Order paid successfully' : 'Could not process PayPal payment'),
        });
    }

    // Button to mark order as paid for Cash on Delivery
    const MarkAsPaidButton = () => {
        const [isPending, startTransition] = useTransition();
        const { toast } = useToast();

        return (
            <Button
            type="button"
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    const res = await updateOrderToPaidCOD(order.id);
                    toast({
                        variant: res.success ? 'default' : 'destructive',
                        title: res.success ? 'Success' : 'Error',
                        description: res.message || (res.success ? 'Order marked as paid' : 'Could not update order to paid'),
                    });
                });
            }}
            >
            {isPending ? 'Processing...' : 'Mark as Paid'}
            </Button>
        );
    }

    // Button to mark order as delivered for Admins
    const MarkAsDeliveredButton = () => {
        const [isPending, startTransition] = useTransition();
        const { toast } = useToast();

        return (
            <Button
                type="button"
                disabled={isPending}
                onClick={() => {
                    startTransition(async () => {
                        const res = await deliverOrder(order.id);
                        toast({
                            variant: res.success ? 'default' : 'destructive',
                            title: res.success ? 'Success' : 'Error',
                            description: res.message || (res.success ? 'Order marked as delivered' : 'Could not update order to delivered'),
                        });
                    });
                }}
            >
                {isPending ? 'Processing...' : 'Mark as Delivered'}
            </Button>
        );
    }

    return <>
       <h1 className="py-4 text-2xl">Order { formatId(order.id)}</h1>
       <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-4y overflow-x-auto">
            <Card>
                <CardContent className="p-4 gap-4">
                    <h2 className="text-xl pb-4">Payment Method</h2>
                    <p>{paymentMethod}</p>
                    { isPaid ? (
                        <Badge variant="outline" className="bg-green-500 text-white">
                            Paid at {formatDateTime(paidAt!).dateTime}
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="mt-2">
                            Not Paid
                        </Badge>
                    )}
                </CardContent>
            </Card>
            <Card className="mt-4">
                <CardContent className="p-4 gap-4">
                    <h2 className="text-xl pb-4">Shipping Address</h2>
                    <p>{shippingAddress.fullName}</p>
                    <p>{shippingAddress.streetAddress}</p>
                    <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                    <p>{shippingAddress.country}</p>
                    { isDelivered ? (
                        <Badge variant="outline" className="bg-green-500 text-white">
                            Delivered at {formatDateTime(deliveredAt!).dateTime}
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="mt-2">
                            Not Delivered
                        </Badge>
                    )}
                </CardContent>
            </Card>
            <Card className="mt-4">
                <CardContent className="p-4 gap-4">
                    <h2 className="text-xl pb-4">Order Items</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderitems.map((item) => (
                                <TableRow key={item.slug}>
                                    <TableCell>
                                        <Link href={`/product/${item.slug}`} className="flex items-center">
                                            <Image src={item.image} alt={item.name} width={50} height={50} className="rounded" />
                                            <span className='px-2'>{item.name}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <span className='px-2'>{item.qty}</span>
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        ${item.price}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="md:gap-5 mt-4 md:mt-0">
            <Card >
                <CardContent className='p-4 gap-4 space-y-4'>
                    <div className="flex justify-between">
                        <div>Items</div>
                        <div>{ formatCurrency(itemsPrice) }</div>
                    </div>
                    <div className="flex justify-between">
                        <div>Shipping</div>
                        <div>{ formatCurrency(shippingPrice) }</div>
                    </div>
                    <div className="flex justify-between">
                        <div>Tax</div>
                        <div>{ formatCurrency(taxPrice) }</div>
                    </div>
                    <div className="flex justify-between font-bold">
                        <div>Total</div>
                        <div>{ formatCurrency(totalPrice) }</div>
                    </div>
                    {/* PayPal Payment */}
                    {!isPaid && paymentMethod === 'PayPal' && (
                        <div>
                            <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                                <PrintLoadingState />
                                <PayPalButtons 
                                    createOrder={handleCreatePayPalOrder} 
                                    onApprove={handleApprovePayPalOrder} 
                                />
                            </PayPalScriptProvider>
                        </div>
                    )}

                    {/*  Cash on Delivery */}
                    {!isPaid && paymentMethod === 'Cash on Delivery' && isAdmin && (
                        <MarkAsPaidButton />
                    )}
                    {/* Admin Deliver Button */}
                    {isPaid && !isDelivered && isAdmin && (
                        <MarkAsDeliveredButton />
                    )}
                </CardContent>
            </Card>
        </div>
       </div>
    </>;
}
 
export default OrderDetailsTable;