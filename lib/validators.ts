import {z} from 'zod';
import { fromatNumberWithDecimal } from './utils';

const currency= z.string().refine((value) => /^\d+(\.\d{2})?$/.test(fromatNumberWithDecimal(Number(value))), {
        message: 'Price must be a valid number with two decimal places'});


export const insertProductSchema = z.object({
    name: z.string().min(3, {message: 'Name must be at least 3 characters long'}),
    slug: z.string().min(3, {message: 'Slug must be at least 3 characters long'}),
    category: z.string().min(3, {message: 'Category must be at least 3 characters long'}),
    brand: z.string().min(3, {message: 'Brand must be at least 3 characters long'}),
    description: z.string().min(3, {message: 'Description must be at least 3 characters long'}),
    stock: z.coerce.number(),
    images: z.array(z.string()).min(1, {message: 'At least one image is required'}),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency,
});

// Schema for signing users in
export const signInFormSchema = z.object({
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: 'Password must be at least 6 characters long'}),
});

// Schema for signing users up
export const signUpFormSchema = z.object({
    name: z.string().min(3, {message: 'Name must be at least 3 characters long'}),
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: 'Password must be at least 6 characters long'}),
    confirmPassword: z.string().min(6, {message: 'Confirm password must be at least 6 characters long'}),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Cart item schema
export const cartItemSchema = z.object({
    productId: z.string().min(1, {message: 'Product is required'}),
    name: z.string().min(1, {message: 'Name is required'}),
    slug: z.string().min(1, {message: 'Slug is required'}),
    qty: z.number().int().nonnegative({message: 'Quantity must be at least 1, and positive'}),
    image: z.string().min(1, {message: 'Image is required'}),
    price: currency

});

// Cart schema
export const cartSchema = z.object({
    items: z.array(cartItemSchema),
    itemsPrice: currency,
    totalPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    sessionCardId: z.string().min(1, {message: 'Session cart id is required'}),
    userId: z.string().optional().nullable(),
});

// Schema for shipping address
export const shippingAddressSchema = z.object({
    fullName: z.string().min(3, {message: 'Full name must be at least 3 characters long'}),
    streetAddress: z.string().min(3, {message: 'Address must be at least 3 characters long'}),
    city: z.string().min(3, {message: 'City must be at least 3 characters long'}),
    postalCode: z.string().min(3, {message: 'Postal code must be at least 3 characters long'}),
    country: z.string().min(3, {message: 'Country must be at least 3 characters long'}),
    lat: z.number().optional(),
    lng: z.number().optional(),
});


