import { Metadata } from "next";
import { getMyOrders } from "@/lib/actions/order-actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow,  } from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";


export const metadata: Metadata = {
    title: 'My Orders',
    description: 'View and manage your orders',
}

const OrdersPage = async ( props: { searchParams: Promise<{page: string}>; }) => {
    const { page } = await props.searchParams;
    const orders = await getMyOrders({ page: Number(page) || 1 });

    return (
        <div className="space-y-2">
            <h1 className="text-2xl font-bold">Orders</h1>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead className="w-[100px]">Total</TableHead>
                            <TableHead className="w-[100px]">Paid</TableHead>
                            <TableHead className="w-[100px]">Delivered</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.data.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{formatId(order.id)}</TableCell>
                                <TableCell>{formatDateTime(order.createdAt).dateTime}</TableCell>
                                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                                <TableCell>
                                    {order.isPaid && order.paidAt
                                        ? formatDateTime(order.paidAt).dateTime
                                        : "Not Paid"}
                                </TableCell>
                                <TableCell>
                                    {order.isDelivered && order.deliveredAt
                                        ? formatDateTime(order.deliveredAt).dateTime
                                        : "Not Delivered"}
                                </TableCell>
                                <TableCell>
                                    <Link href={`/order/${order.id}`} className="text-blue-500 hover:underline">
                                        View
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {orders.totalPages > 1 && (
                    <div className="my-4 flex justify-center">
                        <Pagination
                            page={Number(page) || 1}
                            totalPages={orders?.totalPages}
                            urlParamName="page"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
 
export default OrdersPage;