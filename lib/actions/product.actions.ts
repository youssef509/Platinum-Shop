'use server';
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";


export async function getLatestProducts() {
    

    const data = await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: LATEST_PRODUCTS_LIMIT,
    });
    return convertToPlainObject(data);
}


export async function getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
        where: {
            slug: slug,
        },
    });
}