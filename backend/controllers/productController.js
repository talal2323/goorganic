import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { SubscriptionPlan } from '../models/subscriptionPlanModel.js';
import { SubOrder } from '../models/orderModel.js';
import mongoose from 'mongoose';


//    Create a new product

export const createProduct = async (req, res) => {
    try {
        const vendor = req.user;
        const { images } = req.body;

        if (!images || images.length === 0) {
            return res.status(400).json({ message: 'You must upload at least one product image.' });
        }

        const currentPlan = await SubscriptionPlan.findOne({ name: vendor.subscription.plan });

        if (!currentPlan) {
            return res.status(403).json({ message: 'Invalid subscription plan. Please contact support.' });
        }

        const productCount = await Product.countDocuments({ vendor: vendor._id });
        if (productCount >= currentPlan.productLimit) {
            return res.status(403).json({
                message: `You have reached the ${currentPlan.name} plan limit of ${currentPlan.productLimit} products. Please upgrade your plan to add more.`
            });
        }

        req.body.vendor = vendor._id;
        let product = await Product.create(req.body);
        product = await product.populate('category', 'name');
        res.status(201).json({ success: true, product });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//     Get all featured products for the homepage (first 3 products from each paid vendor)

export const getFeaturedProducts = async (req, res) => {
    try {
        // Get featured vendors (paid subscription, active, approved)
        const featuredVendors = await User.find({
            roles: 'vendor',
            vendorStatus: 'Approved',
            'subscription.plan': 'paid',
            'subscription.status': 'active'
        }).select('_id').limit(10);

        const vendorIds = featuredVendors.map(v => v._id);

        // Get first 3 products from each featured vendor
        const products = [];
        for (const vendorId of vendorIds) {
            const vendorProducts = await Product.find({
                vendor: vendorId,
                status: 'Active'
            })
                .populate('vendor', 'name shopName avatar')
                .populate('category', 'name')
                .limit(3)
                .sort({ createdAt: -1 });

            products.push(...vendorProducts);
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching featured products' });
    }
};

//    Get all products with pagination

export const getAllProducts = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const filter = { status: 'Active' };

        if (req.query.keyword) {
            filter.$or = [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { description: { $regex: req.query.keyword, $options: 'i' } }
            ];
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.vendor) {
            filter.vendor = req.query.vendor;
        }

        if (req.query.price_min || req.query.price_max) {
            filter.price = {};
            if (req.query.price_min) {
                filter.price.$gte = Number(req.query.price_min);
            }
            if (req.query.price_max) {
                filter.price.$lte = Number(req.query.price_max);
            }
        }

        const totalProducts = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .populate('vendor', 'name shopName')
            .populate('category', 'name')
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

//   Get a single product by ID

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('vendor', 'name shopName averageRating vendorStatus')
            .populate('category', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


//    Update a product

export const updateProduct = async (req, res) => {
    try {
        // Step 1: Find the product first to check for ownership
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this product' });
        }

        // ✅ FIX: Perform the update and populate in a single, efficient step
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('category', 'name');

        res.status(200).json({ success: true, product: updatedProduct });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


//    Delete a product

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this product' });
        }

        await product.deleteOne();

        res.status(200).json({ success: true, message: 'Product deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//     Get all products for a logged-in vendor 

export const getMyProducts = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const filter = { vendor: req.user._id };

        if (req.query.keyword) {

            filter.name = { $regex: req.query.keyword, $options: 'i' };
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        const totalProducts = await Product.countDocuments(filter);

        const products = await Product.find(filter)
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

//   Get real-time frequently bought together products for a product

export const getFrequentlyBoughtTogether = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const currentProduct = await Product.findById(id).select('category');

        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productObjectId = new mongoose.Types.ObjectId(id);
        const limit = 5;

        const coPurchaseResults = await SubOrder.aggregate([
            {
                $match: {
                    orderStatus: { $ne: 'Cancelled' },
                    'items.product': productObjectId,
                },
            },
            {
                $project: {
                    otherItems: {
                        $filter: {
                            input: '$items',
                            as: 'item',
                            cond: { $ne: ['$$item.product', productObjectId] },
                        },
                    },
                },
            },
            { $unwind: '$otherItems' },
            {
                $group: {
                    _id: '$otherItems.product',
                    frequency: { $sum: 1 },
                    totalQuantity: { $sum: '$otherItems.quantity' },
                },
            },
            { $sort: { frequency: -1, totalQuantity: -1 } },
            { $limit: limit },
        ]);

        const coPurchasedIds = coPurchaseResults.map((item) => item._id);

        let suggestedProducts = [];

        if (coPurchasedIds.length > 0) {
            const products = await Product.find({
                _id: { $in: coPurchasedIds },
                status: 'Active',
                stock: { $gt: 0 },
            })
                .populate('vendor', 'name shopName')
                .populate('category', 'name');

            const scoreMap = new Map(
                coPurchaseResults.map((item, index) => [item._id.toString(), { frequency: item.frequency, rank: index }])
            );

            suggestedProducts = products
                .sort((a, b) => scoreMap.get(a._id.toString()).rank - scoreMap.get(b._id.toString()).rank)
                .map((product) => ({
                    ...product.toObject(),
                    frequency: scoreMap.get(product._id.toString()).frequency,
                }));
        }

        if (suggestedProducts.length < limit) {
            const excludeIds = [productObjectId, ...suggestedProducts.map((product) => product._id)];
            const remaining = limit - suggestedProducts.length;

            const fallbackProducts = await Product.find({
                _id: { $nin: excludeIds },
                category: currentProduct.category,
                status: 'Active',
                stock: { $gt: 0 },
            })
                .populate('vendor', 'name shopName')
                .populate('category', 'name')
                .sort({ averageRating: -1, createdAt: -1 })
                .limit(remaining);

            suggestedProducts = [...suggestedProducts, ...fallbackProducts];
        }

        res.status(200).json({
            productId: id,
            suggestions: suggestedProducts,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};