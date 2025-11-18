import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { sessionCardId } = await request.json();
        
        if (!sessionCardId) {
            return NextResponse.json(
                { error: 'Session cart ID required' },
                { status: 400 }
            );
        }

        // Find the session cart
        const sessionCart = await prisma.cart.findFirst({
            where: { sessionCardId: sessionCardId }
        });

        if (sessionCart) {
            // Delete any existing user cart
            await prisma.cart.deleteMany({
                where: { userId: session.user.id }
            });

            // Transfer session cart to user
            await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { 
                    userId: session.user.id,
                    sessionCardId: null // Clear session reference
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cart merge error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}