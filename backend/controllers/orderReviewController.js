import mongoose from 'mongoose';
import OrderReview from '../models/orderReviewModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { Order, SubOrder } from '../models/orderModel.js';
import LoyaltyTransaction from '../models/loyaltyTransactionModel.js';

const REVIEW_POPULATE_PUBLIC = [
    { path: 'customer', select: 'name avatar' },
];

const REVIEW_POPULATE_VENDOR = [
    { path: 'customer', select: 'name avatar' },
    { path: 'items.product', select: 'name images' },
];

const REVIEW_POPULATE_ADMIN = [
    { path: 'customer', select: 'name email avatar roles' },
    { path: 'items.product', select: 'name images status averageRating reviewCount' },
    { path: 'items.vendor', select: 'name shopName averageRating reviewCount vendorStatus' },
    { path: 'order', select: 'orderNumber createdAt' },
];

const isCustomerRole = (user) => Array.isArray(user?.roles) && user.roles.includes('customer');

const getPublishedStats = async (match) => {
    const stats = await OrderReview.aggregate([
        { $match: { status: 'Published' } },
        { $unwind: '$items' },
        { $match: match }, // Match AFTER unwind to filter specific items
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$items.rating' },
                reviewCount: { $sum: 1 }, // Count items for rating breakdown
            }
        }
    ]);

    const counts = await OrderReview.aggregate([
        { $match: { status: 'Published' } },
        { $unwind: '$items' },
        { $match: match }, // Match AFTER unwind to filter specific items
        {
            $group: {
                _id: '$items.rating',
                count: { $sum: 1 },
            }
        }
    ]);

    // Count unique reviews (not items)
    const reviewCountAgg = await OrderReview.aggregate([
        { $match: { status: 'Published' } },
        { $unwind: '$items' },
        { $match: match }, // Match AFTER unwind to filter specific items
        {
            $group: {
                _id: '$_id', // Group by review ID to count unique reviews
            }
        },
        {
            $count: 'totalReviews'
        }
    ]);

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    counts.forEach((item) => {
        ratingBreakdown[item._id] = item.count;
    });

    return {
        averageRating: stats[0]?.averageRating || 0,
        reviewCount: reviewCountAgg[0]?.totalReviews || 0,
        ratingBreakdown,
    };
};

const syncRatingStats = async ({ productId, vendorId }) => {
    try {
        const productStats = await getPublishedStats({ 'items.product': new mongoose.Types.ObjectId(productId) });
        const vendorStats = await getPublishedStats({ 'items.vendor': new mongoose.Types.ObjectId(vendorId) });

        const updatedProduct = await Product.findByIdAndUpdate(
            new mongoose.Types.ObjectId(productId),
            {
                averageRating: productStats.averageRating,
                reviewCount: productStats.reviewCount,
            },
            { new: true }
        );

        const updatedVendor = await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(vendorId),
            {
                averageRating: vendorStats.averageRating,
                reviewCount: vendorStats.reviewCount,
            },
            { new: true }
        );

    } catch (err) {
        console.error('syncRatingStats error:', err);
    }
};

// Check if order is eligible for review (all items delivered)
const isOrderDelivered = async (orderId) => {
    const subOrders = await SubOrder.find({ order: orderId });
    return subOrders.length > 0 && subOrders.every((so) => so.orderStatus === 'Delivered');
};

export const getOrderReviewEligibility = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to review this order' });
        }

        const isDelivered = await isOrderDelivered(orderId);

        const existingReview = await OrderReview.findOne({
            order: orderId,
            customer: req.user._id,
        }).populate(REVIEW_POPULATE_PUBLIC);

        const isReviewOwner = existingReview && existingReview.customer._id.toString() === req.user._id.toString();

        res.status(200).json({
            canReview: isDelivered && (!existingReview || isReviewOwner), // Can write new or edit existing
            isDelivered,
            hasExistingReview: Boolean(existingReview),
            existingReview: existingReview || null,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId).select('_id name averageRating reviewCount vendor');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const reviews = await OrderReview.aggregate([
            { $match: { status: 'Published' } },
            { $unwind: '$items' },
            { $match: { 'items.product': new mongoose.Types.ObjectId(productId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customer',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $project: {
                    _id: '$items._id',
                    reviewId: '$_id',
                    orderId: '$order',
                    rating: '$items.rating',
                    comment: '$items.comment',
                    customerId: '$customer._id',
                    customerName: '$customer.name',
                    customerAvatar: '$customer.avatar',
                    createdAt: '$createdAt',
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const stats = await getPublishedStats({ 'items.product': new mongoose.Types.ObjectId(productId) });

        res.status(200).json({
            product,
            reviews,
            ...stats,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createOrderReview = async (req, res) => {
    try {
        if (!isCustomerRole(req.user)) {
            return res.status(403).json({ message: 'Only customers can write reviews.' });
        }

        const { orderId } = req.params;
        const { items, overallRating, deliveryRating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to review this order' });
        }

        const isDelivered = await isOrderDelivered(orderId);
        if (!isDelivered) {
            return res.status(403).json({ message: 'You can only review orders that have been delivered.' });
        }

        const existingReview = await OrderReview.findOne({ order: orderId, customer: req.user._id });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this order.' });
        }

        const numericOverallRating = Number(overallRating);
        if (!numericOverallRating || numericOverallRating < 1 || numericOverallRating > 5) {
            return res.status(400).json({ message: 'Overall rating must be between 1 and 5.' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items with ratings are required.' });
        }

        // Validate each item
        const processedItems = [];
        for (const item of items) {
            const numericRating = Number(item.rating);
            if (!numericRating || numericRating < 1 || numericRating > 5) {
                return res.status(400).json({ message: `Invalid rating for product ${item.product}. Must be between 1 and 5.` });
            }

            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found.` });
            }

            const subOrder = await SubOrder.findOne({
                _id: item.subOrderId,
                'items.product': item.product,
            });
            if (!subOrder) {
                return res.status(404).json({ message: `SubOrder ${item.subOrderId} not found for product.` });
            }

            processedItems.push({
                product: item.product,
                vendor: product.vendor,
                subOrder: item.subOrderId,
                rating: numericRating,
                comment: item.comment?.trim() || '',
            });
        }

        const review = await OrderReview.create({
            order: orderId,
            customer: req.user._id,
            items: processedItems,
            overallRating: numericOverallRating,
            deliveryRating: deliveryRating ? Number(deliveryRating) : undefined,
            comment: comment?.trim() || '',
        });

        // Sync ratings for all products and vendors in the review
        const uniqueProducts = new Set(processedItems.map((item) => item.product.toString()));
        const uniqueVendors = new Set(processedItems.map((item) => item.vendor.toString()));

        for (const productId of uniqueProducts) {
            const product = processedItems.find((item) => item.product.toString() === productId);
            await syncRatingStats({ productId, vendorId: product.vendor });
        }

        const populatedReview = await OrderReview.findById(review._id).populate(REVIEW_POPULATE_PUBLIC);

        // Give 5 points for placing a review
        const customerToUpdate = await User.findById(req.user._id);
        if (customerToUpdate) {
            customerToUpdate.loyaltyPoints = (customerToUpdate.loyaltyPoints || 0) + 5;
            await customerToUpdate.save();
            await LoyaltyTransaction.create({
                user: customerToUpdate._id,
                points: 5,
                type: 'earned',
                reason: 'Order Review',
                orderId: orderId
            });
        }

        res.status(201).json({
            message: 'Review submitted successfully',
            review: populatedReview,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateOrderReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { items, overallRating, deliveryRating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }

        const review = await OrderReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const isOwner = review.customer.toString() === req.user._id.toString();
        const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes('admin');

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        if (overallRating !== undefined) {
            const numericRating = Number(overallRating);
            if (!numericRating || numericRating < 1 || numericRating > 5) {
                return res.status(400).json({ message: 'Overall rating must be between 1 and 5.' });
            }
            review.overallRating = numericRating;
        }

        if (deliveryRating !== undefined) {
            const numericRating = Number(deliveryRating);
            if (numericRating && (numericRating < 1 || numericRating > 5)) {
                return res.status(400).json({ message: 'Delivery rating must be between 1 and 5.' });
            }
            review.deliveryRating = numericRating || undefined;
        }

        if (comment !== undefined) {
            review.comment = comment.trim();
        }

        if (items && Array.isArray(items)) {
            const processedItems = [];
            for (const item of items) {
                const numericRating = Number(item.rating);
                if (!numericRating || numericRating < 1 || numericRating > 5) {
                    return res.status(400).json({ message: 'Item rating must be between 1 and 5.' });
                }

                const product = await Product.findById(item.product);
                if (!product) {
                    return res.status(404).json({ message: `Product ${item.product} not found.` });
                }

                processedItems.push({
                    product: item.product,
                    vendor: product.vendor,
                    subOrder: item.subOrderId,
                    rating: numericRating,
                    comment: item.comment?.trim() || '',
                });
            }
            review.items = processedItems;
        }

        await review.save();

        // Sync ratings for all products and vendors
        const uniqueProducts = new Set(review.items.map((item) => item.product.toString()));
        for (const productId of uniqueProducts) {
            const item = review.items.find((i) => i.product.toString() === productId);
            await syncRatingStats({ productId, vendorId: item.vendor });
        }

        const populatedReview = await OrderReview.findById(review._id).populate(REVIEW_POPULATE_PUBLIC);

        res.status(200).json({
            message: 'Review updated successfully',
            review: populatedReview,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteOrderReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { productId } = req.query; // Optional: delete only this product's item

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }

        const review = await OrderReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const isOwner = review.customer.toString() === req.user._id.toString();
        const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes('admin');

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        let itemsToSync = [];

        if (productId && mongoose.Types.ObjectId.isValid(productId)) {
            // Remove only the item for this product
            const itemIndex = review.items.findIndex((item) => item.product.toString() === productId);
            if (itemIndex === -1) {
                return res.status(404).json({ message: 'Item not found in review' });
            }
            const removedItem = review.items[itemIndex];
            itemsToSync = [removedItem];
            review.items.splice(itemIndex, 1);

            // If no items left, delete the review entirely
            if (review.items.length === 0) {
                await review.deleteOne();
            } else {
                await review.save();
            }
        } else {
            // Delete entire review
            itemsToSync = [...review.items];
            await review.deleteOne();
        }

        // Sync ratings for all affected products and vendors
        const uniqueProducts = new Set(itemsToSync.map((item) => item.product.toString()));
        for (const productId of uniqueProducts) {
            const item = itemsToSync.find((i) => i.product.toString() === productId);
            await syncRatingStats({ productId, vendorId: item.vendor });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getVendorOrderReviews = async (req, res) => {
    try {
        const vendorId = req.user._id;

        const vendor = await User.findById(vendorId).select('_id shopName averageRating reviewCount');
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const reviews = await OrderReview.aggregate([
            { $match: { status: 'Published' } },
            { $unwind: '$items' },
            { $match: { 'items.vendor': new mongoose.Types.ObjectId(vendorId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customer',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            { $unwind: '$customer' },
            { $unwind: { path: '$productData', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: '$_id',
                    itemId: '$items._id',
                    rating: '$items.rating',
                    comment: '$items.comment',
                    customerName: '$customer.name',
                    customerAvatar: '$customer.avatar',
                    productName: '$productData.name',
                    createdAt: '$createdAt',
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const stats = await getPublishedStats({ 'items.vendor': new mongoose.Types.ObjectId(vendorId) });

        res.status(200).json({
            vendor,
            reviews,
            ...stats,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAdminOrderReviews = async (req, res) => {
    try {
        const pageSize = 15;
        const page = Number(req.query.page) || 1;

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.rating) {
            filter.$or = [
                { overallRating: Number(req.query.rating) },
                { 'items.rating': Number(req.query.rating) },
            ];
        }
        if (req.query.keyword) {
            const regex = new RegExp(req.query.keyword, 'i');
            const matchingProducts = await Product.find({ name: regex }).select('_id');
            const productIds = matchingProducts.map(p => p._id);
            const matchingUsers = await User.find({
                $or: [{ name: regex }, { shopName: regex }, { email: regex }]
            }).select('_id');
            const userIds = matchingUsers.map(u => u._id);

            filter.$or = [
                { comment: regex },
                { 'items.comment': regex },
                { customer: { $in: userIds } },
                { 'items.vendor': { $in: userIds } },
                { 'items.product': { $in: productIds } }
            ];
        }

        const totalReviews = await OrderReview.countDocuments(filter);

        const reviews = await OrderReview.find(filter)
            .populate(REVIEW_POPULATE_ADMIN)
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        const stats = await getPublishedStats({});

        res.status(200).json({
            reviews,
            page,
            totalPages: Math.ceil(totalReviews / pageSize),
            totalReviews,
            ...stats,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateOrderReviewStatus = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { status, hiddenReason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }

        if (!['Published', 'Hidden'].includes(status)) {
            return res.status(400).json({ message: 'Invalid review status' });
        }

        const review = await OrderReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.status = status;
        review.hiddenReason = status === 'Hidden' ? (hiddenReason || review.hiddenReason || '') : '';
        await review.save();

        // Sync ratings for all products and vendors
        const uniqueProducts = new Set(review.items.map((item) => item.product.toString()));
        for (const productId of uniqueProducts) {
            const item = review.items.find((i) => i.product.toString() === productId);
            await syncRatingStats({ productId, vendorId: item.vendor });
        }

        const populatedReview = await OrderReview.findById(review._id).populate(REVIEW_POPULATE_ADMIN);

        res.status(200).json({
            message: 'Review status updated successfully',
            review: populatedReview,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
