import Link from "next/link";
import { getAllProducts, deleteProduct } from "@/lib/actions/product.actions";
import { formatCurrency, formatId } from "@/lib/utils";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/shared/pagination";
import DeleteDialog from "@/components/shared/delete-dialog";





export const metadata: Metadata = {
    title: 'Admin Products',
    description: 'Admin products page',
};

const AdminProductsPage = async (props: {
    searchParams: Promise<{ 
        page: string;
        query: string;
        category: string;
    }>;
}) => {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const searchText = searchParams.query || '';
    const category = searchParams.category || '';

    const products = await getAllProducts({ query: searchText, page, category});
    return <>
        <div className="space-y-2">
            <div className="flex-between">
                <h1 className="text-2xl font-bold">Products</h1>
                <Button asChild variant="default" size="sm">
                    <Link href="/admin/products/create">Create Product</Link>
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>RATING</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.data.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>{formatId(product.id)}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>
                                {product.stock > 0 ? (
                                    product.stock >= 5 ? (
                                        <Badge variant="outline" className="bg-green-500 text-white">
                                            {product.stock}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-yellow-500 text-white">
                                            {product.stock}
                                        </Badge>
                                    )
                                ) : (
                                    <Badge variant="destructive" className="mt-2">
                                        Out of Stock
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {Number(product.rating) >= 4 ? (
                                    <Badge variant="outline" className="bg-green-500 text-white">
                                        {product.rating}
                                    </Badge>
                                ) : Number(product.rating) >= 3 ? (
                                    <Badge variant="outline" className="bg-yellow-500 text-white">
                                        {product.rating}
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" className="text-white">
                                        {product.rating}
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="flex gap-1">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/products/${product.id}`}>Edit</Link>
                                </Button>
                                <DeleteDialog id={product.id} action={deleteProduct} />

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {products.totalPages > 1 && products?.totalPages && (
                <Pagination page={page} totalPages={products?.totalPages} urlParamName="page" />
            )}
        </div>
    </>
}
 
export default AdminProductsPage;