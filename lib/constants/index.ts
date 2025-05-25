export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Platinum Shop";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A modern e-commerce store built with Next.js and Tailwind CSS";

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const LATEST_PRODUCTS_LIMIT = Number(process.env.NEXT_PUBLIC_LATEST_PRODUCTS_LIMIT) || 8;


export const signInDefaultValues = {
  email: "admin@gmail.com",
  password: "123123",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValues = {
  fullName: "John Doe",
  streetAddress: "123 Main Street, Apt 4B",
  city: "New York",
  postalCode: "10001",
  country: "United States",
  lat: 40.7128,
  lng: -74.0060,
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS ? process.env.PAYMENT_METHODS.split(", ") : ["PayPal", "Stripe", "Cash on Delivery"];
export const DEFAULT_PAYMENT_METHOD = process.env.DEFAULT_PAYMENT_METHOD || "PayPal";


  