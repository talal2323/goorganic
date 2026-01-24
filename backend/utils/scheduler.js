// utils/scheduler.js
import cron from 'node-cron';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { SubscriptionPlan } from '../models/subscriptionPlanModel.js';
import sendEmail from './sendEmail.js';
import { createNotification } from '../controllers/notificationController.js';

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
                        product.unlistReason = 'system_unlisted'; // Mark as auto-unlisted by system
                        await product.save();
                    }

                    // Create in-app notification
                    await createNotification({
                        userId: vendor._id,
                        type: 'subscription',
                        title: 'Subscription Expired',
                        message: `Your subscription has expired. ${excessCount} products have been unlisted. Upgrade to reactivate them.`,
                        link: '/vendor/subscriptions',
                        metadata: { unlistedCount: excessCount, freeProductLimit }
                    });

                    await sendEmail({
                        email: vendor.email,
                        subject: '⚠️ Your GoOrganic Subscription Has Expired',
                        message: `Hi ${vendor.name},\n\nYour premium subscription has expired and your account has been moved to the ${freePlan.name.toUpperCase()} plan.\n\nTo meet the ${freeProductLimit} product limit, we have automatically unlisted ${excessCount} of your products. To reactivate them, please upgrade your subscription from your dashboard.\n\nBest regards,\nGOorganic Team`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <div style="text-align: center; margin-bottom: 20px;">
                                        <div style="background-color: #fef3c7; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 30px;">⚠️</span>
                                        </div>
                                        <h2 style="color: #d97706; margin: 0;">Subscription Expired</h2>
                                    </div>
                                    <p style="font-size: 16px; color: #374151;">Hi ${vendor.name},</p>
                                    <p style="font-size: 16px; color: #374151;">Your premium subscription has expired and your account has been moved to the <strong>${freePlan.name.toUpperCase()}</strong> plan.</p>
                                    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
                                        <h4 style="color: #92400e; margin-top: 0;">Products Unlisted:</h4>
                                        <p style="margin: 5px 0; color: #374151; font-size: 18px; font-weight: bold;">${excessCount} products have been automatically unlisted</p>
                                        <p style="margin: 5px 0; color: #374151;"><strong>Reason:</strong> ${freePlan.name.toUpperCase()} plan limit is ${freeProductLimit} products</p>
                                    </div>
                                    <p style="font-size: 16px; color: #374151;">To reactivate your unlisted products and continue enjoying premium features, please upgrade your subscription from your vendor dashboard.</p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/subscriptions" style="background-color: #2d6a4f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Upgrade Subscription</a>
                                    </div>
                                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Thank you for being with us!<br/>GOorganic Team 🌱</p>
                                </div>
                            </div>
                        `
                    });
                    console.log(`Downgraded and unlisted products for ${vendor.email}`);

                } else {
                    // Create in-app notification
                    await createNotification({
                        userId: vendor._id,
                        type: 'subscription',
                        title: 'Subscription Expired',
                        message: 'Your subscription has expired and your account has been moved to the free plan.',
                        link: '/vendor/subscriptions'
                    });

                    await sendEmail({
                        email: vendor.email,
                        subject: '⚠️ Your GoOrganic Subscription Has Expired',
                        message: `Hi ${vendor.name},\n\nYour premium subscription has expired and your account has been moved to the ${freePlan.name.toUpperCase()} plan. All your products are within the plan limit.\n\nBest regards,\nGOorganic Team`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <div style="text-align: center; margin-bottom: 20px;">
                                        <div style="background-color: #fef3c7; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 30px;">⚠️</span>
                                        </div>
                                        <h2 style="color: #d97706; margin: 0;">Subscription Expired</h2>
                                    </div>
                                    <p style="font-size: 16px; color: #374151;">Hi ${vendor.name},</p>
                                    <p style="font-size: 16px; color: #374151;">Your premium subscription has expired and your account has been moved to the <strong>${freePlan.name.toUpperCase()}</strong> plan.</p>
                                    <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d6a4f;">
                                        <h4 style="color: #065f46; margin-top: 0;">Good News!</h4>
                                        <p style="margin: 5px 0; color: #374151;">All your products are within the ${freePlan.name.toUpperCase()} plan limit of ${freeProductLimit} products. No products were unlisted.</p>
                                    </div>
                                    <p style="font-size: 16px; color: #374151;">To continue enjoying premium features and higher product limits, you can upgrade your subscription anytime from your vendor dashboard.</p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/subscriptions" style="background-color: #2d6a4f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Subscription Plans</a>
                                    </div>
                                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Thank you for being with us!<br/>GOorganic Team 🌱</p>
                                </div>
                            </div>
                        `
                    });
                    console.log(`Downgraded ${vendor.email}`);
                }

                await vendor.save();

            } catch (error) {
                console.error(`Failed to downgrade ${vendor.email}:`, error);
            }

        } else if (daysUntilExpiry > 6 && daysUntilExpiry <= 7) {
            try {
                // Create in-app notification
                await createNotification({
                    userId: vendor._id,
                    type: 'subscription',
                    title: 'Subscription Expiring Soon',
                    message: 'Your subscription expires in 7 days. Renew now to continue enjoying premium features.',
                    link: '/vendor/subscriptions'
                });

                await sendEmail({
                    email: vendor.email,
                    subject: '⏰ Your GoOrganic Subscription is Expiring Soon',
                    message: `Hi ${vendor.name},\n\nYour premium subscription for ${vendor.shopName} is expiring in 7 days.\n\nPlease renew your plan to continue enjoying premium features.\n\nBest regards,\nGOorganic Team`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="text-align: center; margin-bottom: 20px;">
                                    <div style="background-color: #dbeafe; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 30px;">⏰</span>
                                    </div>
                                    <h2 style="color: #1d4ed8; margin: 0;">Subscription Expiring Soon</h2>
                                </div>
                                <p style="font-size: 16px; color: #374151;">Hi ${vendor.name},</p>
                                <p style="font-size: 16px; color: #374151;">This is a friendly reminder that your premium subscription for <strong>${vendor.shopName}</strong> is expiring in <strong style="color: #d97706;">7 days</strong>.</p>
                                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
                                    <h4 style="color: #92400e; margin-top: 0;">What happens when it expires?</h4>
                                    <p style="margin: 5px 0; color: #374151;">• Your account will be moved to the FREE plan</p>
                                    <p style="margin: 5px 0; color: #374151;">• Product limit will be reduced</p>
                                    <p style="margin: 5px 0; color: #374151;">• Excess products may be automatically unlisted</p>
                                </div>
                                <p style="font-size: 16px; color: #374151;">Renew your subscription now to continue enjoying all premium features without interruption!</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/subscriptions" style="background-color: #2d6a4f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Renew Subscription</a>
                                </div>
                                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Thank you for being a valued vendor!<br/>GOorganic Team 🌱</p>
                            </div>
                        </div>
                    `
                });
                console.log(`Sent expiry reminder to ${vendor.email}`);
            } catch (emailError) {
                console.error(`Failed to send reminder to ${vendor.email}:`, emailError);
            }
        }
    }
};

export const startScheduler = () => {
    console.log('\n========================================');
    console.log('🚀 Scheduler Initialized');
    console.log('========================================');

    // Run once on startup for testing (comment out in production if not needed)
    console.log('⚡ Running initial scheduler test...\n');
    checkSubscriptions();

    // Schedule daily at 10:00 AM
    const job = cron.schedule('0 10 * * *', () => {
        const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
        console.log(`\n========================================`);
        console.log(`📅 DAILY SCHEDULER TRIGGERED at ${now}`);
        console.log(`========================================\n`);
        checkSubscriptions();
    }, {
        timezone: "Asia/Karachi"
    });

    console.log('✅ Scheduler active - Will run daily at 10:00 AM PKT');
    console.log('========================================\n');
};