'use client';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { addItemToCart, getCartItems, removeItemFromCart } from "@/lib/actions/cart.actions";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Cart } from "@/types";
import { Table, TableBody, TableHeader ,TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const CartTable = ({ cart } : { cart?: Cart }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();


    return <>
       {!cart || cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96">
            <h1 className="text-2xl font-bold">Your cart is empty :( </h1>
            <Link href="/" className="mt-4 text-blue-500 hover:underline">
                Go to Products
            </Link>
        </div>

       ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
            <div className="overflow-x-auto md:col-span-3">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cart.items.map((item) => (
                            <TableRow key={item.slug}>
                                <TableCell>
                                    <Link href={`/product/${item.slug}`} className="flex items-center gap-3">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={50}
                                            height={50}
                                            className="rounded-md"
                                        />
                                        <span className="px-2">{item.name}</span>
                                    </Link>
                                </TableCell>
                                <TableCell className="flex-center gap-2">
                                    <Button disabled={isPending} variant="outline" type="button" onClick={() => {
                                        startTransition(async () => {
                                            const res = await removeItemFromCart(item.productId);
                                            if (!res.success) {
                                                toast({
                                                    title: "Error",
                                                    description: res.message,
                                                    variant: "destructive",
                                                });
                                            } else {
                                                router.refresh();
                                            }
                                        });
                                    }}>
                                        {isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                                    </Button>
                                    <span>{item.qty}</span>
                                    <Button disabled={isPending} variant="outline" type="button" onClick={() => {
                                        startTransition(async () => {
                                            const res = await addItemToCart(item);
                                            if (!res.success) {
                                                toast({
                                                    title: "Error",
                                                    description: res.message,
                                                    variant: "destructive",
                                                });
                                            } else {
                                                router.refresh();
                                            }
                                        });
                                    }}>
                                        {isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    </Button>
                                </TableCell>
                                <TableCell className="text-right">${item.price}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
                <Card>
                    <CardContent className="p-4">
                        <div className="pb-3 text-xl">
                            SubTotal ({cart.items.reduce((a, c) => a + c.qty, 0)}): 
                            <span className="font-bold"> { formatCurrency(cart.itemsPrice) }</span>
                        </div>
                        <Button className="w-full" disabled={isPending} onClick={ () => 
                            startTransition( () => {
                                router.push('/shipping-address');
                            })
                        }>
                            {isPending ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            Proceed to Checkout

                        </Button>
                    </CardContent>
                </Card>
        </div>
       )}
    </>;
}
 
export default CartTable;