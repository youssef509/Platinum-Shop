'use client'

// Utility functions for handling post-authentication operations
export async function handlePostSignIn() {
    try {
        // Get the session cart ID from cookies
        const sessionCardId = document.cookie
            .split('; ')
            .find(row => row.startsWith('sessionCardId='))
            ?.split('=')[1];

        if (sessionCardId) {
            // Merge session cart with user cart
            await fetch('/api/cart/merge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionCardId }),
            });

            // Clear the session cart cookie
            document.cookie = 'sessionCardId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }

        // Update user name if needed (this was previously done in JWT callback)
        const session = await fetch('/api/auth/session').then(res => res.json());
        if (session?.user?.name === 'NO_NAME') {
            const newName = session.user.email.split('@')[0];
            await fetch('/api/user/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            });
        }
    } catch (error) {
        console.error('Post sign-in operations failed:', error);
        // Don't throw here to avoid breaking the sign-in flow
    }
}

export async function handleCartMerge(sessionCardId: string) {
    try {
        const response = await fetch('/api/cart/merge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionCardId }),
        });

        if (!response.ok) {
            throw new Error('Failed to merge cart');
        }

        return await response.json();
    } catch (error) {
        console.error('Cart merge failed:', error);
        throw error;
    }
}