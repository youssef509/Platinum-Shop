'use server'
import { shippingAddressSchema, signInFormSchema, signUpFormSchema } from "../validators";
import { signIn, signOut, auth } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { cookies } from "next/headers";

// Sign up the user with credentials
export async function signUpUser(prevState: unknown, formData: FormData) {
    try{
        const user = signUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });
        const plainPassword = user.password;
        user.password = hashSync(user.password, 10);
        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
                role: 'USER',
            }
        });
        await signIn('credentials', {
            email: user.email,
            password: plainPassword,
        });
        return {success: true, message: "User Signed up successfully"}
    } catch (error) {
        if(isRedirectError(error)){
            throw error;
        }
        return {success: false, message: formatError(error)};
    }
}
        

// Sign in the user with credentials
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
    try{
        const user = signInFormSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
        });

        await signIn('credentials', user );

        return {success: true, message: "Signed in successfully"}
    } catch (error) {
        if(isRedirectError(error)){
           throw error;
        }

         return {success: false, message: "Invalid email or password"};
    }
}

// Sign out the user
export async function signOutUser() {
    // const currentCart = await getMyCart();
    // if (currentCart?.id) {
    //     await prisma.cart.delete({ where: { id: currentCart.id } });
    // }
    (await cookies()).delete('sessionCardId');
    await signOut();
}

// Get user by ID
export async function getUserById(userId: string) {
    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

// Update user's address
export async function updateUserAddress(data: ShippingAddress) {
    try { 
        const session = await auth();

        const currentUser = await prisma.user.findFirst({
            where: { id: session?.user?.id }
        });

        if (!currentUser) {
            throw new Error("User not found");
        }

        const address = shippingAddressSchema.parse(data);
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { address }
        });

        return {success: true, message: "Address updated successfully"};
    } catch (error) { 
        return {success: false, message: formatError(error)};
    }
}


