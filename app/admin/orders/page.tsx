import { auth } from "@/auth";
import Pagination from "@/components/shared/pagination";
import { Table, TableHeader, TableRow, TableBody, TableHead, TableCell } from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order-actions";
import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import Link from "next/link";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/delete-dialog";
export const metadata: Metadata = {
    title: 'Admin Orders',
    description: 'Admin orders page',
};


const AdminOrdersPage = async ( props: { searchParams: Promise<{ page: string }> }) => {
    const { page = '1' } = await props.searchParams;
    await requireAdmin();
    const session = await auth();
    if (session?.user.role !== 'admin') {
        throw new Error('You are not authorized to access this page');
    }
    const orders = await getAllOrders({ page: Number(page), limit: 5 });
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
                                        : "Not Paid  "}
                                     | {order.paymentMethod}
                                </TableCell>
                                <TableCell>
                                    {order.isDelivered && order.deliveredAt
                                        ? formatDateTime(order.deliveredAt).dateTime
                                        : "Not Delivered"}
                                </TableCell>
                                <TableCell>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/order/${order.id}`}>
                                            View
                                        </Link>
                                    </Button>
                                    {/* Delete Button */}
                                    <DeleteDialog id={order.id} action={deleteOrder} />
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
 
export default AdminOrdersPage;