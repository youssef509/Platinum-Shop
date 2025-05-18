import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}


export function fromatNumberWithDecimal(num: number) : string {
 const [int, decimal] = num.toString().split('.');
 return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}



// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === 'ZodError') {
    // Handle ZodError
    const failedErrors = Object.keys(error.errors).map((field) => error.errors[field].message); 
    return failedErrors.join(', ');
  } else if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
    // Handle PrismaError
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === 'string' 
    ? error.message 
    : JSON.stringify(error.message);
    
  }
}