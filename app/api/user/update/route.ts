import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { auth } from '@/auth';

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name } = await request.json();
        
        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Update user name in database
        await prisma.user.update({
            where: { id: session.user.id },
            data: { name }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('User update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}