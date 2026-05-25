import SubscriptionBox from '../models/subscriptionBoxModel.js';
import BoxSubscription from '../models/boxSubscriptionModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import {
    addDeliveryInterval,
    createSubscriptionBoxOrder,
} from '../utils/subscriptionBoxOrders.js';

const pickShippingAddress = async ({ userId, addressId, shippingAddress }) => {
    if (addressId) {
        const user = await User.findById(userId).select('savedAddresses');
        const match = user?.savedAddresses?.find((a) => a._id.toString() === addressId.toString());
        if (!match) {
            return null;
        }
        return {
            address: match.address,
            city: match.city,
            postalCode: match.postalCode,
            country: match.country || 'Pakistan',
        };
    }

    if (!shippingAddress) return null;

    const { address, city, postalCode, country } = shippingAddress;
    if (!address || !city || !postalCode) return null;

    return {
        address,
        city,
        postalCode,
        country: country || 'Pakistan',
    };
};

// Vendor: create a subscription box
export const createSubscriptionBox = async (req, res) => {
    try {
        const { title, description, price, frequency, products } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }

        const safePrice = Number(price);
        if (!Number.isFinite(safePrice) || safePrice < 0) {
            return res.status(400).json({ message: 'Invalid price.' });
        }

        if (!['weekly', 'monthly'].includes(frequency)) {
            return res.status(400).json({ message: 'Frequency must be weekly or monthly.' });
        }

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Please select at least one product.' });
        }

        const uniqueProducts = [...new Set(products.map((p) => p.toString()))];

        const vendorProducts = await Product.find({
            _id: { $in: uniqueProducts },
            vendor: req.user._id,
        }).select('_id');

        if (vendorProducts.length !== uniqueProducts.length) {
            return res.status(400).json({ message: 'Some selected products are invalid.' });
        }

        const box = await SubscriptionBox.create({
            vendor: req.user._id,
            title,
            description,
            price: safePrice,
            frequency,
            products: uniqueProducts,
        });

        res.status(201).json(box);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Vendor: list own boxes
export const getMySubscriptionBoxes = async (req, res) => {
    try {
        const boxes = await SubscriptionBox.find({ vendor: req.user._id })
            .populate('products', 'name price stock images status')
            .sort({ createdAt: -1 });

        res.status(200).json(boxes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Public: list active boxes
export const getSubscriptionBoxes = async (req, res) => {
    try {
        const { vendorId } = req.query;

        const filter = { isActive: true };
        if (vendorId) filter.vendor = vendorId;

        const boxes = await SubscriptionBox.find(filter)
            .populate('vendor', 'name shopName')
            .sort({ createdAt: -1 });

        res.status(200).json(boxes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Public: get box details
export const getSubscriptionBoxById = async (req, res) => {
    try {
        const box = await SubscriptionBox.findOne({ _id: req.params.id, isActive: true })
            .populate('vendor', 'name shopName')
            .populate('products', 'name price images');

        if (!box) {
            return res.status(404).json({ message: 'Subscription box not found.' });
        }

        res.status(200).json(box);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Customer: subscribe (COD only) + create first order
export const subscribeToSubscriptionBox = async (req, res) => {
    try {
        const { addressId, shippingAddress, phoneNumber } = req.body;

        const safePhone = (phoneNumber || '').toString().trim();
        if (!safePhone) {
            return res.status(400).json({ message: 'Phone number is required for COD deliveries.' });
        }

        const resolvedAddress = await pickShippingAddress({
            userId: req.user._id,
            addressId,
            shippingAddress,
        });

        if (!resolvedAddress) {
            return res.status(400).json({ message: 'A valid delivery address is required.' });
        }

        const box = await SubscriptionBox.findOne({ _id: req.params.id, isActive: true })
            .populate('vendor', 'name shopName')
            .populate({ path: 'products', select: 'name price stock images status vendor' });

        if (!box) {
            return res.status(404).json({ message: 'Subscription box not found.' });
        }

        const existing = await BoxSubscription.findOne({
            customer: req.user._id,
            box: box._id,
            status: 'active',
        });

        if (existing) {
            return res.status(409).json({ message: 'You already have an active subscription to this box.' });
        }

        // Ensure box products belong to the vendor and are purchasable
        const products = (box.products || []).filter(Boolean);
        if (products.length === 0) {
            return res.status(400).json({ message: 'This subscription box has no products.' });
        }

        for (const p of products) {
            if (p.vendor?.toString() !== box.vendor?._id?.toString()) {
                return res.status(400).json({ message: 'This subscription box contains invalid products.' });
            }
            if (p.status && p.status !== 'Active') {
                return res.status(400).json({ message: `Product "${p.name}" is not active.` });
            }
            if (typeof p.stock === 'number' && p.stock < 1) {
                return res.status(400).json({ message: `Product "${p.name}" is out of stock.` });
            }
        }

        const now = new Date();
        const nextDeliveryDate = addDeliveryInterval(now, box.frequency);

        const subscription = await BoxSubscription.create({
            customer: req.user._id,
            vendor: box.vendor._id,
            box: box._id,
            price: box.price,
            frequency: box.frequency,
            shippingAddress: resolvedAddress,
            phoneNumber: safePhone,
            paymentMethod: 'COD',
            status: 'active',
            nextDeliveryDate,
            lastOrderCreatedAt: now,
        });

        try {
            const { order } = await createSubscriptionBoxOrder({
                customerId: req.user._id,
                vendorId: box.vendor._id,
                boxTitle: box.title,
                boxPrice: box.price,
                products,
                shippingAddress: resolvedAddress,
                phoneNumber: safePhone,
            });

            res.status(201).json({ subscription, firstOrderId: order._id });
        } catch (e) {
            await BoxSubscription.findByIdAndDelete(subscription._id);
            throw e;
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// Vendor: update own subscription box
export const updateSubscriptionBox = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, frequency, products } = req.body;

        const box = await SubscriptionBox.findOne({ _id: id, vendor: req.user._id });
        if (!box) {
            return res.status(404).json({ message: 'Subscription box not found.' });
        }

        // Validate inputs
        if (title !== undefined && !title) {
            return res.status(400).json({ message: 'Title cannot be empty.' });
        }

        if (description !== undefined && !description) {
            return res.status(400).json({ message: 'Description cannot be empty.' });
        }

        if (price !== undefined) {
            const safePrice = Number(price);
            if (!Number.isFinite(safePrice) || safePrice < 0) {
                return res.status(400).json({ message: 'Invalid price.' });
            }
        }

        if (frequency !== undefined && !['weekly', 'monthly'].includes(frequency)) {
            return res.status(400).json({ message: 'Frequency must be weekly or monthly.' });
        }

        if (products !== undefined) {
            if (!Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ message: 'Please select at least one product.' });
            }

            const uniqueProducts = [...new Set(products.map((p) => p.toString()))];
            const vendorProducts = await Product.find({
                _id: { $in: uniqueProducts },
                vendor: req.user._id,
            }).select('_id');

            if (vendorProducts.length !== uniqueProducts.length) {
                return res.status(400).json({ message: 'Some selected products are invalid.' });
            }

            box.products = uniqueProducts;
        }

        if (title !== undefined) box.title = title;
        if (description !== undefined) box.description = description;
        if (price !== undefined) box.price = Number(price);
        if (frequency !== undefined) box.frequency = frequency;

        await box.save();
        await box.populate('products', 'name price stock images status');

        res.status(200).json(box);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Vendor: delete own subscription box
export const deleteSubscriptionBox = async (req, res) => {
    try {
        const { id } = req.params;

        const box = await SubscriptionBox.findOne({ _id: id, vendor: req.user._id });
        if (!box) {
            return res.status(404).json({ message: 'Subscription box not found.' });
        }

        // Check if there are active subscriptions
        const activeSubscriptions = await BoxSubscription.countDocuments({
            box: id,
            status: 'active',
        });

        if (activeSubscriptions > 0) {
            return res.status(400).json({
                message: 'Cannot delete box with active subscriptions. Customers must cancel their subscriptions first.',
            });
        }

        await SubscriptionBox.findByIdAndDelete(id);
        res.status(200).json({ message: 'Subscription box deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: list all subscription boxes
export const getAllSubscriptionBoxes = async (req, res) => {
    try {
        const { status, vendorId, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.isActive = status === 'active';
        if (vendorId) filter.vendor = vendorId;

        const skip = (page - 1) * limit;
        const boxes = await SubscriptionBox.find(filter)
            .populate('vendor', 'name shopName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await SubscriptionBox.countDocuments(filter);

        res.status(200).json({
            boxes,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: delete subscription box
export const adminDeleteSubscriptionBox = async (req, res) => {
    try {
        const { id } = req.params;

        const box = await SubscriptionBox.findById(id);
        if (!box) {
            return res.status(404).json({ message: 'Subscription box not found.' });
        }

        // Check for active subscriptions
        const activeSubscriptions = await BoxSubscription.countDocuments({
            box: id,
            status: 'active',
        });

        if (activeSubscriptions > 0) {
            return res.status(400).json({
                message: `Cannot delete box. There are ${activeSubscriptions} active subscription(s).`,
            });
        }

        await SubscriptionBox.findByIdAndDelete(id);
        res.status(200).json({ message: 'Subscription box deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: toggle box status
export const adminToggleBoxStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean.' });
        }

        const box = await SubscriptionBox.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).populate('vendor', 'name shopName email');

        if (!box) {
            return res.status(404).json({ message: 'Subscription box not found.' });
        }

        res.status(200).json(box);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
