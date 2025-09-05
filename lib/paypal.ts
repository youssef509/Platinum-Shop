const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';


export const paypal = {
    createOrder: async function createOrder(price: number) {
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            }, 
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: price,
                    },
                }],
            }),
        });

        return handleResponse(response);
    },
    capturePayment: async function capturePayment(orderId: string) {
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders/${orderId}/capture`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return handleResponse(response);
    },
};

// Generate PayPal access token  
async function generateAccessToken() { 
    const { PAYPAL_CLIENT_ID, PAYPAL_SECRET } = process.env;
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
    });
    
    const jsonData = await handleResponse(response);
    return jsonData.access_token;
}

// Handel response from PayPal API
async function handleResponse(response: Response) {
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        const errorText = await response.text();
        throw new Error(`PayPal API error: ${response.status} ${errorText}`);
    }
}

export { generateAccessToken };