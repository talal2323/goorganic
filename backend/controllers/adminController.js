import mongoose from 'mongoose';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';
import { SubscriptionPlan } from '../models/subscriptionPlanModel.js';
import Product from '../models/productModel.js';
import { Order, SubOrder } from '../models/orderModel.js';
import OrderReview from '../models/orderReviewModel.js';
import Dispute from '../models/disputeModel.js';
import { createNotification } from './notificationController.js';
import LoyaltyTransaction from '../models/loyaltyTransactionModel.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const buildMonthlySeries = (records, valueKey = 'totalSales', monthsBack = 6) => {
    const lookup = new Map(
        records.map((record) => [
            `${record._id.year}-${record._id.month}`,
            Number(record[valueKey] || 0),
        ])
    );

    const series = [];
    const cursor = new Date();
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    cursor.setMonth(cursor.getMonth() - (monthsBack - 1));

    for (let index = 0; index < monthsBack; index += 1) {
        const year = cursor.getFullYear();
        const month = cursor.getMonth() + 1;
        series.push({
            label: `${MONTH_LABELS[cursor.getMonth()]} ${String(year).slice(-2)}`,
            totalSales: lookup.get(`${year}-${month}`) || 0,
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return series;
};

export const approveVendor = async (req, res) => {
    const vendor = await User.findById(req.params.id);

    if (vendor && Array.isArray(vendor.roles) && vendor.roles.includes('vendor')) {
        vendor.vendorStatus = 'Approved';
        vendor.rejectionReason = undefined;
        await vendor.save({ validateBeforeSave: false });

        // Create in-app notification
        await createNotification({
            userId: vendor._id,
            type: 'vendor',
            title: 'Account Approved!',
            message: 'Congratulations! Your vendor account has been approved. You can now start listing products.',
            link: '/vendor'
        });

        await sendEmail({
            email: vendor.email,
            subject: '🎉 Congratulations! Your GOorganic Vendor Account is Approved',
            message: 'Welcome to GOorganic! Your vendor account has been approved. You can now log in and start listing your products.',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="background-color: #d1fae5; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 40px;">✅</span>
                            </div>
                            <h2 style="color: #2d6a4f; margin: 0;">🎉 Congratulations!</h2>
                        </div>
                        <p style="font-size: 16px; color: #374151;">Dear ${vendor.name},</p>
                        <p style="font-size: 16px; color: #374151;">We're excited to inform you that your GOorganic vendor account has been <strong>approved</strong>!</p>
                        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #065f46; margin-top: 0;">What's Next?</h3>
                            <ul style="color: #374151; padding-left: 20px;">
                                <li>Log in to your vendor dashboard</li>
                                <li>Start listing your organic products</li>
                                <li>Manage orders and inventory</li>
                                <li>Grow your business with us!</li>
                            </ul>
                        </div>
                        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <p style="margin: 0; color: #1e40af; font-size: 14px;">📚 <strong>Need Help?</strong> Contact us at goorganic.co.pk@gmail.com</p>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Welcome to the GOorganic family!<br/>GOorganic Team 🌱</p>
                    </div>
                </div>
            `
        });

        res.status(200).json({ message: 'Vendor has been approved.' });
    } else {
        res.status(404).json({ message: 'Vendor not found.' });
    }
};

//    Reject a vendor

export const rejectVendor = async (req, res) => {
    const { reason } = req.body;
    if (!reason) {
        return res.status(400).json({ message: 'A rejection reason is required.' });
    }

    const vendor = await User.findById(req.params.id);

    if (vendor && Array.isArray(vendor.roles) && vendor.roles.includes('vendor')) {
        vendor.vendorStatus = 'Rejected';
        vendor.rejectionReason = reason;
        await vendor.save();

        // Create in-app notification
        await createNotification({
            userId: vendor._id,
            type: 'vendor',
            title: 'Application Update',
            message: `Your vendor application was not approved. Reason: ${reason}`,
            link: '/vendor/business-info'
        });

        await sendEmail({
            email: vendor.email,
            subject: '📝 Update on Your GOorganic Vendor Application',
            message: `We regret to inform you that your vendor application was not approved at this time for the following reason: ${reason}. Please update your profile and resubmit.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #dc2626; margin-top: 0;">📝 Application Update</h2>
                        <p style="font-size: 16px; color: #374151;">Dear ${vendor.name},</p>
                        <p style="font-size: 16px; color: #374151;">Thank you for your interest in joining GOorganic as a vendor.</p>
                        <p style="font-size: 16px; color: #374151;">After careful review, we regret to inform you that your application was not approved at this time.</p>
                        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                            <h4 style="color: #991b1b; margin-top: 0;">Reason:</h4>
                            <p style="margin: 0; color: #374151;">${reason}</p>
                        </div>
                        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #1e40af; margin-top: 0;">What You Can Do:</h4>
                            <ul style="color: #374151; padding-left: 20px;">
                                <li>Review and address the concerns mentioned above</li>
                                <li>Update your profile with correct information</li>
                                <li>Resubmit your application</li>
                                <li>Contact us if you have questions: goorganic.co.pk@gmail.com</li>
                            </ul>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">We appreciate your interest in GOorganic.<br/>GOorganic Team 🌱</p>
                    </div>
                </div>
            `
        });

        res.status(200).json({ message: 'Vendor has been rejected.' });
    } else {
        res.status(404).json({ message: 'Vendor not found.' });
    }
};

//           Create a new subscription plan

export const createSubscriptionPlan = async (req, res) => {
    try {
        const { name, price, productLimit, features } = req.body;
        const plan = await SubscriptionPlan.create({ name, price, productLimit, features });
        res.status(201).json(plan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//    Get all subscription plans

export const getAllSubscriptionPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({});
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//         Update existing subscription plan

export const updateSubscriptionPlan = async (req, res) => {
    try {
        const { price, productLimit, features } = req.body;

        const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
            req.params.id,
            { price, productLimit, features },
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ message: 'Subscription plan not found.' });
        }

        res.status(200).json(updatedPlan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//     Delete a subscription plan

export const deleteSubscriptionPlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ message: 'Subscription plan not found.' });
        }

        const activeSubscribers = await User.countDocuments({ 'subscription.plan': plan.name });

        if (activeSubscribers > 0) {
            return res.status(400).json({
                message: `Cannot delete plan. ${activeSubscribers} vendor(s) are currently subscribed to it.`
            });
        }

        await plan.deleteOne();

        res.status(200).json({ message: 'Subscription plan deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//    Get all vendors for the admin panel

export const getAllVendorsForAdmin = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const filter = { roles: 'vendor' };
        if (req.query.status) {
            filter.vendorStatus = req.query.status;
        }

        const totalVendors = await User.countDocuments(filter);

        const vendors = await User.find(filter)

            .select('-password')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({
            vendors,
            page,
            totalPages: Math.ceil(totalVendors / pageSize)
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//     Get all products for the admin panel (with pagination)

export const getAllProductsForAdmin = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;

        const filter = {};

        if (req.query.keyword) {
            filter.name = { $regex: req.query.keyword, $options: 'i' };
        }

        if (req.query.vendorId) {
            filter.vendor = req.query.vendorId;
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        const totalProducts = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .populate('vendor', 'name shopName')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({
            products,
            page,
            totalPages: Math.ceil(totalProducts / pageSize)
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//     Update a product's status

export const updateProductStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;
        if (!status || !['Active', 'Unlisted'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const product = await Product.findById(req.params.id).populate('vendor', 'name email');
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const previousStatus = product.status;
        product.status = status;

        // Store unlist reason if unlisting
        if (status === 'Unlisted' && reason) {
            product.unlistReason = reason;
        }

        // Clear unlist reason if activating
        if (status === 'Active') {
            product.unlistReason = undefined;
        }

        await product.save();

        // Send email to vendor if product is being unlisted
        if (status === 'Unlisted' && previousStatus !== 'Unlisted' && product.vendor) {
            const emailMessage = `
Dear ${product.vendor.name},

Your product "${product.name}" has been unlisted from GOorganic marketplace.

Reason: ${reason || 'No reason provided'}

To request reactivation of this product, please:
1. Address the issues mentioned above
2. Update your product details if necessary
3. Contact our support team or reply to this email with your request

We will review your request and reactivate the product if it meets our quality standards.

Thank you for your understanding.

Best regards,
GOorganic Team
            `;

            await sendEmail({
                email: product.vendor.email,
                subject: `⚠️ Product Unlisted: ${product.name}`,
                message: emailMessage,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #dc2626; margin-top: 0;">⚠️ Product Unlisted</h2>
                            <p style="font-size: 16px; color: #374151;">Dear ${product.vendor.name},</p>
                            <p style="font-size: 16px; color: #374151;">Your product <strong>"${product.name}"</strong> has been unlisted from GOorganic marketplace.</p>
                            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                                <h4 style="color: #991b1b; margin-top: 0;">Reason:</h4>
                                <p style="margin: 0; color: #374151;">${reason || 'No reason provided'}</p>
                            </div>
                            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="color: #1e40af; margin-top: 0;">To Request Reactivation:</h4>
                                <ol style="color: #374151; padding-left: 20px; margin: 10px 0;">
                                    <li>Address the issues mentioned above</li>
                                    <li>Update your product details if necessary</li>
                                    <li>Contact our support team at goorganic.co.pk@gmail.com</li>
                                </ol>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">We will review your request and reactivate the product if it meets our quality standards.</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Thank you for your understanding.<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
            });
        }

        // Send email to vendor if product is being activated from unlisted status
        if (status === 'Active' && previousStatus === 'Unlisted' && product.vendor) {
            const emailMessage = `
Dear ${product.vendor.name},

Great news! Your product "${product.name}" has been reactivated and is now live on GOorganic marketplace.

Your product is now visible to customers and available for purchase. Thank you for addressing the concerns and maintaining our quality standards.

Keep up the great work!

Best regards,
GOorganic Team
            `;

            await sendEmail({
                email: product.vendor.email,
                subject: `✅ Product Reactivated: ${product.name}`,
                message: emailMessage,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="background-color: #d1fae5; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 30px;">✅</span>
                                </div>
                                <h2 style="color: #2d6a4f; margin: 0;">Product Reactivated!</h2>
                            </div>
                            <p style="font-size: 16px; color: #374151;">Dear ${product.vendor.name},</p>
                            <p style="font-size: 16px; color: #374151;">Great news! Your product <strong>"${product.name}"</strong> has been reactivated and is now live on GOorganic marketplace.</p>
                            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #065f46; font-size: 16px;">✨ Your product is now visible to customers and available for purchase!</p>
                            </div>
                            <p style="font-size: 16px; color: #374151;">Thank you for addressing the concerns and maintaining our quality standards.</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Keep up the great work!<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
            });
        }

        res.status(200).json({ message: `Product status updated to '${status}'.` });

    } catch (error) {
        console.error('Update product status error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//     Get all customers for the admin panel

export const getAllCustomers = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const filter = { roles: 'customer' };

        const totalCustomers = await User.countDocuments(filter);

        const customers = await User.find(filter)
            .select('name email phoneNumber createdAt isSuspended suspendedAt suspendedBy suspensionReason loyaltyPoints')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({
            customers,
            page,
            totalPages: Math.ceil(totalCustomers / pageSize)
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//     Get key statistics for the admin dashboard

export const getAdminDashboardStats = async (req, res) => {
    try {
        const [totalVendors, pendingVendors, totalCustomers, totalProducts, salesResult, newOrdersToday, openDisputes, resolvedDisputes, salesByMonthRaw] = await Promise.all([
            User.countDocuments({ roles: 'vendor' }),
            User.countDocuments({ roles: 'vendor', vendorStatus: 'Pending' }),
            User.countDocuments({ roles: 'customer' }),
            Product.countDocuments({}),
            Order.aggregate([
                { $match: { paymentStatus: 'Completed' } },
                { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
            ]),
            Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
            Dispute.countDocuments({ status: { $in: ['Open', 'Under Review'] } }),
            Dispute.countDocuments({ status: 'Resolved' }),
            Order.aggregate([
                { $match: { paymentStatus: 'Completed' } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        totalSales: { $sum: '$totalAmount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);
        const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;
        const totalDisputes = openDisputes + resolvedDisputes;
        const resolutionRate = totalDisputes > 0 ? Math.round((resolvedDisputes / totalDisputes) * 100) : 100;

        res.status(200).json({
            totalVendors,
            pendingVendors,
            totalCustomers,
            totalProducts,
            totalSales,
            newOrdersToday,
            openDisputes,
            resolvedDisputes,
            resolutionRate,
            salesByMonth: buildMonthlySeries(salesByMonthRaw),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getAdminAnalyticsOverview = async (req, res) => {
    try {
        const [salesByMonthRaw, categorySalesRaw, vendorRevenueRaw, vendorRatingsRaw, disputes] = await Promise.all([
            Order.aggregate([
                { $match: { paymentStatus: 'Completed' } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        totalSales: { $sum: '$totalAmount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            SubOrder.aggregate([
                { $match: { orderStatus: 'Delivered' } },
                { $unwind: '$items' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.product',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'product.category',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $group: {
                        _id: '$category.name',
                        totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                        orderCount: { $sum: 1 }
                    }
                },
                { $sort: { totalSales: -1 } },
                { $limit: 8 }
            ]),
            SubOrder.aggregate([
                { $match: { orderStatus: 'Delivered' } },
                {
                    $group: {
                        _id: '$vendor',
                        totalSales: { $sum: '$subTotal' },
                        totalOrders: { $sum: 1 }
                    }
                },
                { $sort: { totalSales: -1 } },
                { $limit: 8 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendor'
                    }
                },
                { $unwind: '$vendor' },
                {
                    $project: {
                        vendorId: '$_id',
                        shopName: { $ifNull: ['$vendor.shopName', '$vendor.name'] },
                        totalSales: 1,
                        totalOrders: 1,
                    }
                }
            ]),
            OrderReview.aggregate([
                { $match: { status: 'Published' } },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.vendor',
                        averageRating: { $avg: '$items.rating' },
                        reviewCount: { $sum: 1 }
                    }
                }
            ]),
            Dispute.find({})
                .populate('customer', 'name email')
                .populate('vendor', 'name shopName')
                .populate('order', 'orderNumber')
                .populate('subOrder', 'orderStatus')
                .sort({ createdAt: -1 })
                .limit(12)
        ]);

        const vendorRatingsMap = new Map(
            vendorRatingsRaw.map((entry) => [entry._id.toString(), entry])
        );

        const vendorPerformance = vendorRevenueRaw.map((entry) => {
            const vendorId = entry.vendorId?.toString?.() || String(entry.vendorId || '');
            const rating = vendorRatingsMap.get(vendorId);
            return {
                ...entry,
                averageRating: rating?.averageRating || 0,
                reviewCount: rating?.reviewCount || 0,
            };
        });

        const lowestRatedVendors = [...vendorPerformance]
            .filter((entry) => entry.reviewCount > 0)
            .sort((a, b) => a.averageRating - b.averageRating)
            .slice(0, 5);

        const combinedDisputes = [];

        disputes.forEach((dispute) => {
            combinedDisputes.push({
                id: dispute._id,
                type: dispute.issueType,
                title: dispute.subject,
                vendor: dispute.vendor?.shopName || dispute.vendor?.name || 'Vendor',
                customer: dispute.customer?.name || 'Customer',
                reason: dispute.description,
                createdAt: dispute.createdAt,
                link: '/admin/disputes',
                severity: dispute.priority === 'High' ? 'high' : 'medium',
                proofImage: dispute.proofImage,
                status: dispute.status,
                vendorComment: dispute.vendorComment
            });
        });

        combinedDisputes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            salesByMonth: buildMonthlySeries(salesByMonthRaw),
            categorySales: categorySalesRaw,
            vendorPerformance,
            lowestRatedVendors,
            disputeSummary: {
                openDisputes: disputes.filter((item) => ['Open', 'Under Review'].includes(item.status)).length,
                resolvedDisputes: disputes.filter((item) => item.status === 'Resolved').length,
                rejectedDisputes: disputes.filter((item) => item.status === 'Rejected').length,
            },
            disputeCases: combinedDisputes.slice(0, 12),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//    Get all orders for the admin panel
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCustomerLoyaltyHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const history = await LoyaltyTransaction.find({ user: id })
            .populate('orderId', 'orderNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({ balance: user.loyaltyPoints || 0, history });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== ACCOUNT DELETION MANAGEMENT ====================

// Get all pending deletion requests
export const getDeletionRequests = async (req, res) => {
    try {
        const requests = await User.find({
            deletionRequested: true,
            isDeleted: false
        })
            .select('name email deletionRequestDate deletionReason roles createdAt')
            .sort({ deletionRequestDate: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin approves deletion (soft delete)
export const approveDeletion = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isDeleted) {
            return res.status(400).json({ message: 'User already deleted' });
        }

        // Soft delete
        user.isDeleted = true;
        user.deletedAt = Date.now();
        user.deletedBy = req.user._id;
        user.deletionRequested = false;
        await user.save({ validateBeforeSave: false });

        // Send email notification to user
        try {
            await sendEmail({
                email: user.email,
                subject: 'Account Deletion Confirmation - GOorganic',
                message: `Dear ${user.name},\n\nYour account deletion request has been processed and your account has been successfully deleted.\n\nAccount Details:\n- Email: ${user.email}\n- Deletion Date: ${new Date(user.deletedAt).toLocaleString()}\n\nIf you wish to use our services again in the future, you have two options:\n1. Register with a new email address\n2. Contact our support team at goorganic.co.pk@gmail.com to request account restoration\n\nThank you for being part of the GOorganic community.\n\nBest regards,\nGOorganic Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #6b7280; margin-top: 0;">Account Deletion Confirmation</h2>
                            <p style="font-size: 16px; color: #374151;">Dear ${user.name},</p>
                            <p style="font-size: 16px; color: #374151;">Your account deletion request has been processed and your account has been successfully deleted.</p>
                            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="color: #374151; margin-top: 0;">Account Details:</h4>
                                <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${user.email}</p>
                                <p style="margin: 5px 0; color: #6b7280;"><strong>Deletion Date:</strong> ${new Date(user.deletedAt).toLocaleString()}</p>
                            </div>
                            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="color: #1e40af; margin-top: 0;">Future Options:</h4>
                                <p style="margin: 5px 0; color: #374151;">If you wish to use our services again:</p>
                                <ol style="color: #374151; padding-left: 20px; margin: 10px 0;">
                                    <li>Register with a new email address</li>
                                    <li>Contact support at goorganic.co.pk@gmail.com for account restoration</li>
                                </ol>
                            </div>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Thank you for being part of the GOorganic community.<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send user notification:', emailError);
            // Don't fail the request if email fails
        }

        res.status(200).json({
            message: 'User account has been deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin rejects deletion request
export const rejectDeletion = async (req, res) => {
    try {
        const { userId } = req.params;
        const { rejectionReason } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clear deletion request
        user.deletionRequested = false;
        user.deletionRequestDate = null;
        user.deletionReason = null;
        await user.save({ validateBeforeSave: false });

        // Send email to user
        try {
            await sendEmail({
                email: user.email,
                subject: 'Account Deletion Request Update - GOorganic',
                message: `Dear ${user.name},\n\nYour account deletion request has been reviewed by our admin team.\n\nStatus: Request Denied\n\n${rejectionReason ? `Reason: ${rejectionReason}` : ''}\n\nYour account remains active and you can continue using our services.\n\nIf you have any questions or concerns, please contact us at goorganic.co.pk@gmail.com\n\nBest regards,\nGOorganic Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d6a4f; margin-top: 0;">Account Deletion Request Update</h2>
                            <p style="font-size: 16px; color: #374151;">Dear ${user.name},</p>
                            <p style="font-size: 16px; color: #374151;">Your account deletion request has been reviewed by our admin team.</p>
                            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                                <h4 style="color: #92400e; margin-top: 0;">Status: Request Denied</h4>
                                ${rejectionReason ? `<p style="margin: 0; color: #374151;"><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
                            </div>
                            <p style="font-size: 16px; color: #374151;">Your account remains <strong>active</strong> and you can continue using our services.</p>
                            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                                <p style="margin: 0; color: #1e40af; font-size: 14px;">💬 Questions? Contact us at <a href="mailto:goorganic.co.pk@gmail.com" style="color: #2d6a4f;">goorganic.co.pk@gmail.com</a></p>
                            </div>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Best regards,<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send user notification:', emailError);
        }

        res.status(200).json({
            message: 'Deletion request rejected successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin restores deleted account
export const restoreAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isDeleted) {
            return res.status(400).json({ message: 'User account is not deleted' });
        }

        // Restore account
        user.isDeleted = false;
        user.deletedAt = null;
        user.deletedBy = null;
        await user.save({ validateBeforeSave: false });

        // Send email notification
        try {
            await sendEmail({
                email: user.email,
                subject: '🎉 Account Restored - GOorganic',
                message: `Dear ${user.name},\n\nGreat news! Your GOorganic account has been restored.\n\nYou can now log in and continue using our services:\n- Email: ${user.email}\n- Restoration Date: ${new Date().toLocaleString()}\n\nWelcome back to GOorganic!\n\nBest regards,\nGOorganic Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="background-color: #d1fae5; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 40px;">🎉</span>
                                </div>
                                <h2 style="color: #2d6a4f; margin: 0;">Account Restored!</h2>
                            </div>
                            <p style="font-size: 16px; color: #374151;">Dear ${user.name},</p>
                            <p style="font-size: 16px; color: #374151;">Great news! Your GOorganic account has been successfully restored.</p>
                            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="color: #065f46; margin-top: 0;">Account Details:</h4>
                                <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${user.email}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Restoration Date:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            <p style="font-size: 16px; color: #374151;">You can now log in and continue using our services!</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Welcome back to GOorganic!<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send user notification:', emailError);
        }

        res.status(200).json({
            message: 'User account restored successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Suspend a user
export const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Suspension reason is required' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent suspending admin users
        if (user.roles && user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Cannot suspend admin users' });
        }

        if (user.isSuspended) {
            return res.status(400).json({ message: 'User is already suspended' });
        }

        user.isSuspended = true;
        user.suspendedAt = new Date();
        user.suspendedBy = req.user._id;
        user.suspensionReason = reason;
        await user.save({ validateBeforeSave: false });

        // Send email notification
        try {
            await sendEmail({
                email: user.email,
                subject: '⚠️ Account Suspended - GOorganic',
                message: `Dear ${user.name},\n\nYour GOorganic account has been suspended.\n\nReason: ${reason}\n\nSuspension Date: ${new Date().toLocaleString()}\n\nIf you believe this is an error, please contact us at goorganic.co.pk@gmail.com\n\nBest regards,\nGOorganic Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="background-color: #fee2e2; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 40px;">⚠️</span>
                                </div>
                                <h2 style="color: #dc2626; margin: 0;">Account Suspended</h2>
                            </div>
                            <p style="font-size: 16px; color: #374151;">Dear ${user.name},</p>
                            <p style="font-size: 16px; color: #374151;">We regret to inform you that your GOorganic account has been suspended.</p>
                            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                                <h4 style="color: #991b1b; margin-top: 0;">Suspension Reason:</h4>
                                <p style="margin: 0; color: #374151;">${reason}</p>
                            </div>
                            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
                                <p style="margin: 5px 0; color: #374151;"><strong>Suspension Date:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            <p style="font-size: 16px; color: #374151; margin-top: 20px;">If you believe this is an error or have any questions, please contact us at goorganic.co.pk@gmail.com</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send suspension notification:', emailError);
        }

        res.status(200).json({
            message: 'User suspended successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unsuspend a user
export const unsuspendUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isSuspended) {
            return res.status(400).json({ message: 'User is not suspended' });
        }

        user.isSuspended = false;
        user.suspendedAt = null;
        user.suspendedBy = null;
        user.suspensionReason = null;
        await user.save({ validateBeforeSave: false });

        // Send email notification
        try {
            await sendEmail({
                email: user.email,
                subject: '✅ Account Unsuspended - GOorganic',
                message: `Dear ${user.name},\n\nGood news! Your GOorganic account suspension has been lifted.\n\nYou can now log in and continue using our services.\n\nRestoration Date: ${new Date().toLocaleString()}\n\nBest regards,\nGOorganic Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="background-color: #d1fae5; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 40px;">✅</span>
                                </div>
                                <h2 style="color: #2d6a4f; margin: 0;">Account Unsuspended!</h2>
                            </div>
                            <p style="font-size: 16px; color: #374151;">Dear ${user.name},</p>
                            <p style="font-size: 16px; color: #374151;">Good news! Your GOorganic account suspension has been lifted.</p>
                            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="color: #065f46; margin-top: 0;">Account Status:</h4>
                                <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> Active</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Restoration Date:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            <p style="font-size: 16px; color: #374151;">You can now log in and continue using our services!</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Welcome back!<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send unsuspension notification:', emailError);
        }

        res.status(200).json({
            message: 'User unsuspended successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};