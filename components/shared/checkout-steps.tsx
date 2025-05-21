import React from "react";
import { cn } from "@/lib/utils";

const CheckoutSteps = ( { current = 0 } ) => {
    return <>
        <div className="flex-between flex-col md:flex-row space-x-2 space-y-2 mb-10">
            { ['User Login', 'Shipping Address', 'Payment Method', 'Place Order'].map((step, index) => (
                <React.Fragment key={step}>
                    <div className={cn('p-2 w-56 text-center rounded-full text-sm', index === current ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white ')}>
                        {step}
                    </div>
                    { step !== 'Place Order' && (
                        <hr className="w-16 border-t border-gray-300 mx-2" />
                    )}
                </React.Fragment>
            )) }
        </div>
    </>;
}
 
export default CheckoutSteps;