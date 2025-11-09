// utils/scheduler.js
import cron from 'node-cron';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { SubscriptionPlan } from '../models/subscriptionPlanModel.js';
import sendEmail from './sendEmail.js';

const checkSubscriptions = async () => {
    console.log('Running scheduled job: Checking subscriptions...');

    const today = new Date();

    const paidVendors = await User.find({
        'subscription.plan': 'paid',
        'subscription.status': 'active'
    });

    const freePlan = await SubscriptionPlan.findOne({ name: 'free' });
    if (!freePlan) {
        console.error('CRITICAL: "free" plan not found in database. Cannot process downgrades.');
        return;
    }
    const freeProductLimit = freePlan.productLimit;


    for (const vendor of paidVendors) {
        const expiryDate = new Date(vendor.subscription.endDate);
        const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);

        if (daysUntilExpiry <= 0) {
            try {
                vendor.subscription.plan = 'free';
                vendor.subscription.status = 'expired';

                const productCount = await Product.countDocuments({ vendor: vendor._id, status: 'Active' });

                if (productCount > freeProductLimit) {
                    const excessCount = productCount - freeProductLimit;

                    const productsToUnlist = await Product.find({ vendor: vendor._id, status: 'Active' })
                        .sort({ createdAt: -1 })
                        .limit(excessCount);

                    for (const product of productsToUnlist) {
                        product.status = 'Unlisted';
                        await product.save();
                    }

                    await sendEmail({
                        email: vendor.email,
                        subject: 'Your GoOrganic Subscription Has Expired',
                        message: `Hi ${vendor.name},\n\nYour premium subscription has expired and your account has been moved to the ${freePlan.name} plan.\n\n` +
                            `To meet the ${freeProductLimit} product limit, we have automatically unlisted ${excessCount} of your products. To reactivate them, please upgrade your subscription from your dashboard.`
                    });
                    console.log(`Downgraded and unlisted products for ${vendor.email}`);

                } else {
                    await sendEmail({
                        email: vendor.email,
                        subject: 'Your GoOrganic Subscription Has Expired',
                        message: `Hi ${vendor.name},\n\nYour premium subscription has expired and your account has been moved to the ${freePlan.name} plan. All your products are within the plan limit.`
                    });
                    console.log(`Downgraded ${vendor.email}`);
                }

                await vendor.save();

            } catch (error) {
                console.error(`Failed to downgrade ${vendor.email}:`, error);
            }

        } else if (daysUntilExpiry > 6 && daysUntilExpiry <= 7) {
            try {
                await sendEmail({
                    email: vendor.email,
                    subject: 'Your GoOrganic Subscription is Expiring Soon',
                    message: `Hi ${vendor.name},\n\nYour premium subscription for ${vendor.shopName} is expiring in 7 days.\n\nPlease renew your plan to continue enjoying premium features.`
                });
                console.log(`Sent expiry reminder to ${vendor.email}`);
            } catch (emailError) {
                console.error(`Failed to send reminder to ${vendor.email}:`, emailError);
            }
        }
    }
};

export const startScheduler = () => {
    cron.schedule('0 10 * * *', () => {
        checkSubscriptions();
    });
};