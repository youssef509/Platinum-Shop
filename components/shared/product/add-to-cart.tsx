'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Cart, CartItem } from "@/types";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ cart ,item }: { cart?: Cart ,item: CartItem } ) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handelAddToCart = async () => {
        startTransition( async() => {
            const res = await addItemToCart(item);
            if (res && res.success) {
                toast({
                    description: res.message,
                    variant: "default",
                    action: <ToastAction 
                    className="bg-primary text-white hover:bg-gray-800 dark:text-gray-800 dark:hover:bg-text-white dark:hover:text-white"  
                    altText="Undo" 
                    onClick={() => router.push("/cart")}
                    >
                        Go to Cart
                    </ToastAction>,
                });
            } else {
                toast({
                    title: "Error",
                    description: res?.message || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
            })
        return;
    };
    const handelremoveItemFromCart = async () => {
        startTransition( async() => {
            const res = await removeItemFromCart(item.productId);
            if (res && res.success) {
                toast({
                    description: res.message,
                    variant: "default",
                    action: <ToastAction 
                    className="bg-primary text-white hover:bg-gray-800 dark:text-gray-800 dark:hover:bg-text-white dark:hover:text-white"  
                    altText="Undo" 
                    onClick={() => router.push("/cart")}
                    >
                        Go to Cart
                    </ToastAction>,
                });
            }
            else {
                toast({
                    title: "Error",
                    description: res?.message || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
            })
        return;
    };

    // Check if item is in cart
    const existItem = cart && cart.items.find((x) => x.productId === item.productId);

    return existItem ? (
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" onClick={handelremoveItemFromCart}>
                {isPending ? (<Loader className="h-4 w-4 animate-spin" />) : (<Minus className="h-4 w-4" />)}
            </Button>
            <span>{existItem.qty}</span>
            <Button variant="outline" size="icon" onClick={handelAddToCart}>
                {isPending ? (<Loader className="h-4 w-4 animate-spin" />) : (<Plus className="h-4 w-4" />)}
            </Button>
        </div>
    ) : (
        <Button onClick={handelAddToCart} className="w-full">
          {isPending ? (<Loader className="h-4 w-4 animate-spin" />) : (<Plus className="h-4 w-4" />)}
          Add to Cart
        </Button>
    );
}
 
export default AddToCart;