import Stripe from 'stripe';
import User from '../models/userModel.js';
import { SubscriptionPlan } from '../models/subscriptionPlanModel.js';
import { createNotification } from './notificationController.js';

// Lazy initialization - create Stripe instance when needed, not at module load
let stripeInstance;
const getStripe = () => {
    if (!stripeInstance) {
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeInstance;
};

// Create Stripe Checkout Session for Subscription
export const createSubscriptionCheckout = async (req, res) => {
    const stripe = getStripe();
    try {
        const { planName } = req.body;
        const vendorId = req.user._id;

        // Get the subscription plan
        const plan = await SubscriptionPlan.findOne({ name: planName });
        if (!plan) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }

        // Don't allow downgrade to free plan via Stripe
        if (planName === 'free') {
            return res.status(400).json({ message: 'Cannot subscribe to free plan via payment' });
        }

        const vendor = await User.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Create Stripe Checkout Session for one-time payment (not recurring)
        const session = await stripe.checkout.sessions.create({
            customer_email: vendor.email,
            mode: 'payment', // One-time payment, not subscription
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'pkr',
                        product_data: {
                            name: `${plan.name.toUpperCase()} Subscription Plan - 1 Month`,
                            description: `${plan.productLimit} products limit - Valid for 30 days`,
                        },
                        unit_amount: plan.price * 100, // Convert to paise
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/vendor/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/vendor/subscriptions?cancelled=true`,
            metadata: {
                userId: vendorId.toString(),
                planName: planName,
            },
        });

        res.json({ checkoutUrl: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Error creating subscription checkout:', error);
        res.status(500).json({ 
            message: 'Error creating subscription checkout', 
            error: error.message 
        });
    }
};

// Verify subscription session after successful payment
export const verifySubscriptionSession = async (req, res) => {
    const stripe = getStripe();
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session || session.metadata.userId !== userId.toString()) {
            return res.status(404).json({ message: 'Session not found or unauthorized' });
        }

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Update user's subscription in database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the subscription plan details
        const planName = session.metadata.planName;
        const plan = await SubscriptionPlan.findOne({ name: planName });

        if (!plan) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }

        // Calculate end date (30 days from now)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        // Update user's subscription (one-time payment, manual renewal required)
        user.subscription = {
            plan: plan.name,
            status: 'active',
            startDate: startDate,
            endDate: endDate,
        };

        await user.save();

        // Create notification for vendor
        await createNotification({
            userId: user._id,
            type: 'subscription',
            title: 'Subscription Activated',
            message: `Your ${plan.name.toUpperCase()} subscription has been activated for 30 days!`,
            link: '/vendor/subscriptions',
        });

        res.json({
            success: true,
            planName: plan.name,
            status: 'active',
            startDate: startDate,
            endDate: endDate,
        });
    } catch (error) {
        console.error('Error verifying subscription session:', error);
        res.status(500).json({ 
            message: 'Error verifying subscription', 
            error: error.message 
        });
    }
};

// Cancel subscription (downgrade to free plan)
export const cancelStripeSubscription = async (req, res) => {
    try {
        const vendor = await User.findById(req.user._id);
        
        if (!vendor.subscription || vendor.subscription.plan === 'free') {
            return res.status(400).json({ message: 'No active paid subscription found' });
        }

        // Get the free plan
        const freePlan = await SubscriptionPlan.findOne({ name: 'free' });

        // Downgrade to free plan
        vendor.subscription.plan = 'free';
        vendor.subscription.status = 'cancelled';
        vendor.subscription.endDate = new Date();
        
        await vendor.save();

        // Notify vendor
        await createNotification({
            userId: vendor._id,
            type: 'subscription',
            title: 'Subscription Cancelled',
            message: 'Your subscription has been cancelled and downgraded to FREE plan',
            link: '/vendor/subscriptions',
        });

        res.json({ 
            message: 'Subscription cancelled successfully',
            newPlan: 'free'
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ 
            message: 'Error cancelling subscription', 
            error: error.message 
        });
    }
};
