import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyCart } from "@/lib/actions/cart.actions";
import { Metadata } from "next";
import { ShippingAddress } from "@/types";
import { getUserById } from "@/lib/actions/user.actions";
import ShippingAddressForm from "./shipping-address-form";
import CheckoutSteps from "@/components/shared/checkout-steps";



export const metadata: Metadata = {
    title: 'Shipping Address',
    description: 'Your shipping address',
}

const ShippingAddressPage = async () => {
    const cart = await getMyCart();
    if (!cart || cart.items.length === 0)  redirect('/cart');

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("No user ID");

    const user = await getUserById(userId);

    return <>
            <CheckoutSteps current={1} />
            <ShippingAddressForm address={user.address as ShippingAddress} />
        </>;
}
 
export default ShippingAddressPage;