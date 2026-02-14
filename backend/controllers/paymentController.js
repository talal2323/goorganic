import Stripe from 'stripe';
import { Order } from '../models/orderModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents/paise
            currency: 'pkr',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: orderId || 'pending',
                userId: req.user._id.toString(),
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            message: 'Error creating payment intent',
            error: error.message
        });
    }
};

// Get payment intent status
export const getPaymentStatus = async (req, res) => {
    try {
        const { paymentIntentId } = req.params;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        res.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
        });
    } catch (error) {
        console.error('Error retrieving payment status:', error);
        res.status(500).json({
            message: 'Error retrieving payment status',
            error: error.message
        });
    }
};

// Webhook handler for Stripe events (optional but recommended)
export const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntent.id);

            // Update order payment status if needed
            if (paymentIntent.metadata.orderId && paymentIntent.metadata.orderId !== 'pending') {
                try {
                    await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
                        'paymentInfo.status': 'paid',
                        'paymentInfo.paidAt': new Date(),
                    });
                } catch (error) {
                    console.error('Error updating order payment status:', error);
                }
            }
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('PaymentIntent failed:', failedPayment.id);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};
