'use client'

import React from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/common/UIComponents';

const StripeCheckoutForm = ({ onSuccess, onError, amount, loading: parentLoading, setLoading: setParentLoading, formData, saveAddress, addressLabel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form fields before processing payment
        if (!formData?.fullName || !formData?.email || !formData?.phone || !formData?.address || !formData?.city || !formData?.postalCode) {
            onError('Please fill in all required shipping information');
            return;
        }

        if (saveAddress && !addressLabel?.trim()) {
            onError('Please enter a label for this address');
            return;
        }

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setParentLoading(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`,
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error('Payment error:', error);
                onError(error.message || 'Payment failed. Please try again.');
                setIsProcessing(false);
                setParentLoading(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent.id);
            } else {
                onError('Payment processing failed. Please try again.');
                setIsProcessing(false);
                setParentLoading(false);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            onError('An unexpected error occurred. Please try again.');
            setIsProcessing(false);
            setParentLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <div className="text-sm text-gray-600 mt-2">
                <p>💳 Test payment with card: 4242 4242 4242 4242</p>
                <p>Use any future expiry date, any 3-digit CVC, and any postal code.</p>
            </div>
            <Button
                type="submit"
                className="w-full"
                disabled={!stripe || isProcessing || parentLoading}
            >
                {isProcessing ? 'Processing Payment...' : `Pay Rs. ${amount?.toLocaleString()}`}
            </Button>
        </form>
    );
};

export default StripeCheckoutForm;
