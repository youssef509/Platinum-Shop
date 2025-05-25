'use client';
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/actions/order-actions";
import { Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

const PlaceOrderForm = () => {
    const router = useRouter();

    const handelSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const res = await createOrder();
        
        if (res.redirect) {
            router.push(res.redirect);
        } 
    }

    const PlaceOrderButton = () => {
        const { pending } = useFormStatus();
        return (
            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                    <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                    </>
                ) : (
                    <>
                        <Check className="mr-2 h-4 w-4" />
                        Place Order
                    </>
                )}
            </Button>
        );
    }
    return <>
       <div className="mt-4">
            <form onSubmit={handelSubmit} className="w-full">
                <PlaceOrderButton />
            </form>
        </div>
    </>;
}
 
export default PlaceOrderForm;