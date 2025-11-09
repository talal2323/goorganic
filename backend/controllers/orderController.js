import { Order, SubOrder } from '../models/orderModel.js';
import { Cart } from '../models/cartModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';

//   Create a new order from the user's cart
export const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shippingAddress, phoneNumber } = req.body;

        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            return res.status(400).json({ message: 'Please provide a complete shipping address.' });
        }
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Please provide a phone number for delivery.' });
        }

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty.' });
        }

        let totalAmount = 0;
        const vendorItems = new Map();

        for (const item of cart.items) {

            if (item.product.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${item.product.name}` });
            }

            const price = item.product.price * item.quantity;
            totalAmount += price;

            const vendorId = item.vendor.toString();
            if (!vendorItems.has(vendorId)) {
                vendorItems.set(vendorId, []);
            }
            vendorItems.get(vendorId).push({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                image: item.product.images[0].url
            });
        }

        const parentOrder = await Order.create({
            customer: userId,
            totalAmount,
            shippingAddress,
            phoneNumber,
        });

        for (const [vendorId, items] of vendorItems.entries()) {
            const subTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            await SubOrder.create({
                order: parentOrder._id,
                vendor: vendorId,
                items,
                subTotal,
                orderStatus: 'Processing'
            });

            try {
                const vendor = await User.findById(vendorId);
                if (vendor) {
                    await sendEmail({
                        email: vendor.email,
                        subject: 'You have a new order! (GOorganic)',
                        message: `You've received a new order with a subtotal of ${subTotal}. Please log in to your vendor dashboard to review and process it.`
                    });
                }
            } catch (emailError) {
                console.error('Failed to send new order notification to vendor:', emailError);
            }
        }

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        await Cart.deleteOne({ _id: cart._id });

        res.status(201).json(parentOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};