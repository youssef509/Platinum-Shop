

import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.actions";

export const metadata = {
    title: 'Cart',
    description: 'Your shopping cart',
  }


const CartPage = async () => {
    const cart = await getMyCart();
    // Ensure sessionCardId is a string (not null) before passing to CartTable
    const safeCart = cart
        ? { ...cart, sessionCardId: cart.sessionCardId ?? "" }
        : undefined;
    return <>
        <section className="container mx-auto mt-10">
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
            <div className="mt-4">
                <CartTable cart={safeCart} />
            </div>
        </section>
    </>;
}
 
export default CartPage;