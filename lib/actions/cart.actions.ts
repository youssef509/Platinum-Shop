'use server'
import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, round2 } from "../utils";
import { cartSchema, cartItemSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";



// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
   const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
   );
   const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
   const taxPrice = round2(0.15 * itemsPrice);
   const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

   return {
      itemsPrice: itemsPrice.toFixed(2),
      shippingPrice: shippingPrice.toFixed(2),
      taxPrice: taxPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
   }
}

// Add item to cart
export async function addItemToCart(data: CartItem) {

   try {
      // Check for the cart cookie
      const sessionCardId = (await cookies()).get('sessionCardId')?.value;
      if (!sessionCardId) throw new Error("Session cart ID not found");

      // Get session and user id
      const session = await auth();
      const userId = session?.user?.id ? (session.user.id as string) : undefined;
      
      // Get Cart
      const cart = await getMyCart();
      
      // parse and validate item
      const item = cartItemSchema.parse(data);
     
      // Find product in database
      const product = await prisma.product.findFirst({
         where: {
            id: item.productId,
         }
      });
      
      if (!product) throw new Error("Product not found");

      // Create new cart object
      if (!cart) {
         // Create new cart
         const newCart = cartSchema.parse({
            userId: userId,
            items: [item],
            sessionCardId: sessionCardId,
            ...calcPrice([item]),
         });
         // Save cart to database
         await prisma.cart.create({
            data: newCart,
         });
         // Revalidate product page
         revalidatePath(`/product/${product.slug}`);
         
         return {
               success: true,
               message: `${product.name} added to cart`,
          }
      } else {
         // Check if item already exists in cart
         const existItem = (cart.items as CartItem[]).find((x) => x.productId === item.productId);
         if (existItem) {
            // Check the stock
            if (product.stock < existItem.qty + 1) {
               throw new Error("Not enough stock");
            }
            // Incerease the quantity
             (cart.items as CartItem[]).find((x) => x.productId === item.productId)!.qty = existItem.qty + 1;
         } else { 
            // If item does not exist
            // Check the stock
            if (product.stock < 1) {
               throw new Error("Not enough stock");
            }
            // Add the item to the cart.items
            (cart.items as CartItem[]).push(item);
            
         }
         // Save cart to database
         await prisma.cart.update({
            where: {
               id: cart.id,
            },
            data: {
             items: cart.items as Prisma.CartUpdateitemsInput[],
             ...calcPrice(cart.items as CartItem[]),
            },
         });

         // Revalidate product page
         revalidatePath(`/product/${product.slug}`);

         return {
            success: true,
            message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`,
         }

      }

   } catch (error) {
      console.error(error);
      return {
         success: false,
         message: "Error adding item to cart",
      }

   }
   
}

export async function getMyCart() {
      // Check for the cart cookie
      const sessionCardId = (await cookies()).get('sessionCardId')?.value;
      if (!sessionCardId) throw new Error("Session cart ID not found");

      // Get session and user id
      const session = await auth();
      const userId = session?.user?.id ? (session.user.id as string) : undefined;

      // Get user cart from database
      const cart = await prisma.cart.findFirst({
         where: userId ? {userId: userId} : {sessionCardId: sessionCardId}
      });

      if (!cart) return undefined;

      // Convert decimals and return
      return convertToPlainObject({
         ...cart,
         items: cart.items as CartItem[],
         itemsPrice: cart.itemsPrice.toString(),
         shippingPrice: cart.shippingPrice.toString(),
         taxPrice: cart.taxPrice.toString(),
         totalPrice: cart.totalPrice.toString(),
      })   
}

export async function removeItemFromCart(productId: string) {
   try {
      // Check for the cart cookie
      const sessionCardId = (await cookies()).get('sessionCardId')?.value;
      if (!sessionCardId) throw new Error("Session cart ID not found");

      // Get Product
      const product = await prisma.product.findFirst({
         where: {
            id: productId,
         }
      });
      if (!product) throw new Error("Product not found");

      // Get user cart from database
      const cart = await getMyCart();
      if (!cart) throw new Error("Cart not found");

      // Check for the item in the cart
      const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
      if (!exist) throw new Error("Item not found in cart");

      // Check if the item is the only one in the cart
      if (exist.qty === 1) {
         // Remove the item from the cart.items
         cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== exist.productId);
      } else {
         // Decrease the quantity
         (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty = exist.qty - 1;
      }

      // Update the cart in the database
      await prisma.cart.update({
         where: {
            id: cart.id,
         },
         data: {
            items: cart.items as Prisma.CartUpdateitemsInput[],
            ...calcPrice(cart.items as CartItem[]),
         },
      });

      // Revalidate product page
      revalidatePath(`/product/${product.slug}`);
      
      return {
         success: true,
         message: `${product.name} removed from cart`,
      }
   } catch (error) {
      console.error(error);
      return {
         success: false,
         message: "Error removing item from cart",
      }
   }
}