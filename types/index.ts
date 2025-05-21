import { z } from "zod";
import { insertProductSchema,
         cartItemSchema,
         cartSchema,
         shippingAddressSchema,
} from "@/lib/validators";

export type Product = z.infer<typeof insertProductSchema> & {
    id: string;
    rating: string;
    createdAt: Date;
};


export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
