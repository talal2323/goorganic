import { Order, SubOrder } from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { createNotification } from '../controllers/notificationController.js';

export const addDeliveryInterval = (fromDate, frequency) => {
    const date = new Date(fromDate);
    if (frequency === 'weekly') {
        date.setDate(date.getDate() + 7);
        return date;
    }

    if (frequency === 'monthly') {
        date.setMonth(date.getMonth() + 1);
        return date;
    }

    throw new Error('Invalid delivery frequency');
};

const buildBundleItems = ({ products, totalPrice }) => {
    const items = (products || []).map((p) => ({
        product: p._id,
        name: p.name,
        quantity: 1,
        price: Number(p.price || 0),
        image: p.images?.[0]?.url,
    }));

    if (items.length === 0) return [];

    const bundleTotal = Number(totalPrice || 0);
    const baseTotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

    // If the base total is invalid, split equally.
    if (!Number.isFinite(baseTotal) || baseTotal <= 0 || !Number.isFinite(bundleTotal)) {
        const perItem = Math.floor(bundleTotal / items.length);
        let running = 0;

        for (let i = 0; i < items.length; i++) {
            if (i === items.length - 1) {
                items[i].price = Math.max(0, bundleTotal - running);
            } else {
                items[i].price = Math.max(0, perItem);
                running += items[i].price;
            }
        }

        return items;
    }

    // Proportional distribution (floor + remainder on last item) so sum(prices) === bundleTotal
    let running = 0;
    for (let i = 0; i < items.length; i++) {
        if (i === items.length - 1) {
            items[i].price = Math.max(0, bundleTotal - running);
        } else {
            const rawShare = (Number(items[i].price || 0) / baseTotal) * bundleTotal;
            const share = Math.floor(rawShare);
            items[i].price = Math.max(0, share);
            running += items[i].price;
        }
    }

    return items;
};

export const createSubscriptionBoxOrder = async ({
    customerId,
    vendorId,
    boxTitle,
    boxPrice,
    products,
    shippingAddress,
    phoneNumber,
}) => {
    if (!customerId || !vendorId) {
        throw new Error('Missing customer/vendor for subscription order');
    }

    const safePrice = Number(boxPrice);
    if (!Number.isFinite(safePrice) || safePrice < 0) {
        throw new Error('Invalid subscription box price');
    }

    // Keep shipping rules consistent with normal checkout.
    // (Checkout: Rs. 200 shipping if subtotal < 3000, otherwise free.)
    const shippingFee = safePrice >= 3000 ? 0 : 200;

    const now = new Date();

    // Validate stock before creating the order
    for (const p of products || []) {
        if (p.status && p.status !== 'Active') {
            throw new Error(`Product ${p.name || p._id} is not active`);
        }
        if (typeof p.stock === 'number' && p.stock < 1) {
            throw new Error(`Product ${p.name || p._id} is out of stock`);
        }
    }

    const parentOrder = await Order.create({
        customer: customerId,
        totalAmount: safePrice + shippingFee,
        shippingFee,
        shippingAddress,
        phoneNumber,
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
    });

    parentOrder.orderNumber = `ORD-${parentOrder._id.toString().slice(-8).toUpperCase()}`;
    await parentOrder.save();

    const items = buildBundleItems({ products, totalPrice: safePrice });
    const subTotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

    const subOrder = await SubOrder.create({
        order: parentOrder._id,
        vendor: vendorId,
        items,
        subTotal,
        orderStatus: 'Pending',
    });

    // Decrement stock (quantity is always 1 here)
    for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -Number(item.quantity || 0) },
        });
    }

    // Lightweight in-app notifications (avoid email spam for recurring orders)
    try {
        const vendor = await User.findById(vendorId).select('shopName name');
        await createNotification({
            userId: vendorId,
            type: 'order',
            title: 'New Subscription Box Order',
            message: `You received a new ${boxTitle ? `"${boxTitle}" ` : ''}subscription order of Rs. ${subTotal.toLocaleString()}`,
            link: '/vendor/orders',
            metadata: { orderId: parentOrder._id, subTotal, source: 'subscription-box' },
        });

        await createNotification({
            userId: customerId,
            type: 'order',
            title: 'Subscription Order Created',
            message: `A new ${vendor?.shopName || vendor?.name || 'vendor'} delivery has been scheduled (COD).`,
            link: '/orders',
            metadata: { orderId: parentOrder._id, subTotal, source: 'subscription-box' },
        });
    } catch (e) {
        console.error('Subscription order notifications failed:', e);
    }

    return { order: parentOrder, subOrder };
};
