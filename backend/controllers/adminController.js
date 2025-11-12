import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';
import { SubscriptionPlan } from '../models/subscriptionPlanModel.js';
import Product from '../models/productModel.js';
import { Order, SubOrder } from '../models/orderModel.js';

export const approveVendor = async (req, res) => {
    const vendor = await User.findById(req.params.id);

    if (vendor && Array.isArray(vendor.roles) && vendor.roles.includes('vendor')) {
        vendor.vendorStatus = 'Approved';
        vendor.rejectionReason = undefined;
        await vendor.save({ validateBeforeSave: false });


        await sendEmail({
            email: vendor.email,
            subject: 'Congratulations! Your GOorganic Account is Approved',
            message: 'Welcome to GOorganic! Your vendor account has been approved. You can now log in and start listing your products.'
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


        await sendEmail({
            email: vendor.email,
            subject: 'Update on Your GOorganic Vendor Application',
            message: `We regret to inform you that your vendor application was not approved at this time for the following reason: ${reason}. Please update your profile and resubmit.`
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

//     Upgrade a vendor's subscription plan

export const upgradeVendorSubscription = async (req, res) => {
    try {
        const { planName } = req.body;

        const plan = await SubscriptionPlan.findOne({ name: planName });
        if (!plan) {
            return res.status(404).json({ message: `Plan '${planName}' not found.` });
        }

        const vendor = await User.findById(req.params.id);
        if (!vendor || !vendor.roles.includes('vendor')) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }


        vendor.subscription.plan = plan.name;
        vendor.subscription.status = 'active';

        vendor.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await vendor.save();

        res.status(200).json({ message: `Vendor ${vendor.name} successfully upgraded to ${plan.name} plan.` });

    } catch (error) {
        res.status(400).json({ message: error.message });
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
        const pageSize = 10;
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
        const { status } = req.body;
        if (!status || !['Active', 'Unlisted'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        product.status = status;
        await product.save();

        res.status(200).json({ message: `Product status updated to '${status}'.` });

    } catch (error) {
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

            .select('name email createdAt')
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
        const totalVendors = await User.countDocuments({ roles: 'vendor' });
        const pendingVendors = await User.countDocuments({ roles: 'vendor', vendorStatus: 'Pending' });
        const totalCustomers = await User.countDocuments({ roles: 'customer' });
        const totalProducts = await Product.countDocuments({});

        const salesResult = await Order.aggregate([
            { $match: { paymentStatus: 'Completed' } },
            { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
        ]);
        const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;

        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
        const newOrdersToday = await Order.countDocuments({ createdAt: { $gte: startOfDay } });

        res.status(200).json({
            totalVendors,
            pendingVendors,
            totalCustomers,
            totalProducts,
            totalSales,
            newOrdersToday
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
                subject: 'Account Deletion Confirmation - GO Organic',
                message: `
Dear ${user.name},

Your account deletion request has been processed and your account has been successfully deleted.

Account Details:
- Email: ${user.email}
- Deletion Date: ${new Date(user.deletedAt).toLocaleString()}

If you wish to use our services again in the future, you have two options:
1. Register with a new email address
2. Contact our support team at goorganic.co.pk@gmail.com to request account restoration

Thank you for being part of the GO Organic community.

Best regards,
GOorganic Team
                `,
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
                subject: 'Account Deletion Request Update - GO Organic',
                message: `
Dear ${user.name},

Your account deletion request has been reviewed by our admin team.

Status: Request Denied

${rejectionReason ? `Reason: ${rejectionReason}` : ''}

Your account remains active and you can continue using our services.

If you have any questions or concerns, please contact us at admin@goorganic.com

Best regards,
GO Organic Team
                `,
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
                subject: 'Account Restored - GO Organic',
                message: `
Dear ${user.name},

Great news! Your GO Organic account has been restored.

You can now log in and continue using our services:
- Email: ${user.email}
- Restoration Date: ${new Date().toLocaleString()}

Welcome back to GO Organic!

Best regards,
GO Organic Team
                `,
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