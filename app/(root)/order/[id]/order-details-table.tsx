'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order } from "@/types";
import Link from "next/link";
import Image from "next/image";

const OrderDetailsTable = ({ order } : { order: Order}) => {
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
                </CardContent>
            </Card>
        </div>
       </div>
    </>;
}
 
export default OrderDetailsTable;