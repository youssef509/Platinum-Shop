import { generateAccessToken, paypal } from '../lib/paypal';

// Test to ensure that the PayPal access token can be generated
test('Generate PayPal access token', async () => {
    const tokenResponse = await generateAccessToken();
    console.log(tokenResponse);
    expect(typeof tokenResponse).toBe('string');
    expect(tokenResponse.length).toBeGreaterThan(0);
})


// Test to create a PayPal order
test('Create PayPal order', async () => {
    const price = 10.00; // Example price
    const orderResponse = await paypal.createOrder(price);
    console.log(orderResponse);
    expect(orderResponse).toHaveProperty('id');
    expect(orderResponse).toHaveProperty('status');
    expect(orderResponse.status).toBe('CREATED');
    
})

// Test to capture a PayPal payment with mock order
test('Capture PayPal payment with mock order', async () => {
    const mockOrderId = '100';
    const mockCapturePayment = jest
    .spyOn(paypal, 'capturePayment')
    .mockResolvedValue({
        status: 'COMPLETED',
    });
    const captureResponse = await paypal.capturePayment(mockOrderId);
    expect(captureResponse).toHaveProperty('status', 'COMPLETED');
    mockCapturePayment.mockRestore();
});

