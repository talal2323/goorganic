import { Order, SubOrder } from '../models/orderModel.js';
import { Cart } from '../models/cartModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';

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
                const customer = await User.findById(userId);
                if (vendor) {
                    const itemsList = items.map(item => `• ${item.name} x${item.quantity} - Rs. ${(item.price * item.quantity).toLocaleString()}`).join('\n');

                    // Create in-app notification for vendor
                    await createNotification({
                        userId: vendorId,
                        type: 'order',
                        title: 'New Order Received',
                        message: `You have a new order worth Rs. ${subTotal.toLocaleString()} from ${customer.name}`,
                        link: '/vendor/orders',
                        metadata: { orderId: parentOrder._id, subTotal, itemCount: items.length }
                    });

                    await sendEmail({
                        email: vendor.email,
                        subject: '🎉 New Order Received - GOorganic',
                        message: `Hello ${vendor.businessName || vendor.name},\n\nYou have received a new order!\n\nOrder Details:\n${itemsList}\n\nSubtotal: Rs. ${subTotal.toLocaleString()}\n\nCustomer: ${customer.name}\nPhone: ${phoneNumber}\nShipping Address: ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.postalCode}\n\nPlease log in to your vendor dashboard to review and process this order.\n\nThank you for being a valued vendor!`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <h2 style="color: #2d6a4f; margin-top: 0;">🎉 New Order Received!</h2>
                                    <p style="font-size: 16px; color: #374151;">Hello <strong>${vendor.businessName || vendor.name}</strong>,</p>
                                    <p style="font-size: 16px; color: #374151;">You have received a new order. Please review and process it as soon as possible.</p>
                                    
                                    <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d6a4f;">
                                        <h3 style="color: #2d6a4f; margin-top: 0;">Order Summary</h3>
                                        <p style="margin: 5px 0; color: #374151; font-size: 18px;"><strong>Subtotal: Rs. ${subTotal.toLocaleString()}</strong></p>
                                    </div>
                                    
                                    <div style="margin: 20px 0;">
                                        <h4 style="color: #374151;">Items Ordered:</h4>
                                        <ul style="list-style: none; padding: 0; background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                                            ${items.map(item => `
                                                <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                                                    <span style="color: #374151;">• ${item.name} <strong>x${item.quantity}</strong></span>
                                                    <span style="color: #2d6a4f; font-weight: bold;">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                    
                                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                        <h4 style="color: #374151; margin-top: 0;">Customer Information</h4>
                                        <p style="margin: 5px 0; color: #6b7280;"><strong>Name:</strong> ${customer.name}</p>
                                        <p style="margin: 5px 0; color: #6b7280;"><strong>Phone:</strong> ${phoneNumber}</p>
                                        <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${customer.email}</p>
                                        <p style="margin: 5px 0; color: #6b7280;"><strong>Shipping Address:</strong><br/>${shippingAddress.street}<br/>${shippingAddress.city}, ${shippingAddress.postalCode}<br/>${shippingAddress.country}</p>
                                    </div>
                                    
                                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Thank you for being a valued GOorganic vendor!</p>
                                </div>
                            </div>
                        `
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

        // Send order confirmation email to customer
        try {
            const customer = await User.findById(userId);
            if (customer) {
                const allItems = [];
                for (const [vendorId, items] of vendorItems.entries()) {
                    allItems.push(...items);
                }

                // Create in-app notification for customer
                await createNotification({
                    userId: userId,
                    type: 'order',
                    title: 'Order Placed Successfully',
                    message: `Your order of Rs. ${totalAmount.toLocaleString()} has been confirmed and is being processed`,
                    link: '/orders',
                    metadata: { orderId: parentOrder._id, totalAmount, itemCount: allItems.length }
                });

                // Notify all admins about new order
                const admins = await User.find({ roles: 'admin' });
                for (const admin of admins) {
                    await createNotification({
                        userId: admin._id,
                        type: 'order',
                        title: 'New Order Placed',
                        message: `${customer.name} placed an order of Rs. ${totalAmount.toLocaleString()} (${allItems.length} items)`,
                        link: '/admin/orders',
                        metadata: { orderId: parentOrder._id, customerName: customer.name, totalAmount, itemCount: allItems.length }
                    });
                }

                await sendEmail({
                    email: customer.email,
                    subject: '✅ Order Confirmed - GOorganic',
                    message: `Dear ${customer.name},\n\nThank you for your order!\n\nYour order has been confirmed and is being processed.\n\nOrder Number: #${parentOrder._id.toString().slice(-8).toUpperCase()}\nTotal Amount: Rs. ${totalAmount.toLocaleString()}\n\nItems:\n${allItems.map(item => `• ${item.name} x${item.quantity} - Rs. ${(item.price * item.quantity).toLocaleString()}`).join('\n')}\n\nShipping Address:\n${shippingAddress.street}\n${shippingAddress.city}, ${shippingAddress.postalCode}\n${shippingAddress.country}\n\nEstimated Delivery: 1-2 days\n\nYou can track your order status in your dashboard.\n\nThank you for choosing GOorganic!`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <div style="background-color: #d1fae5; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 30px;">✅</span>
                                    </div>
                                    <h2 style="color: #2d6a4f; margin: 0;">Order Confirmed!</h2>
                                </div>
                                
                                <p style="font-size: 16px; color: #374151;">Dear <strong>${customer.name}</strong>,</p>
                                <p style="font-size: 16px; color: #374151;">Thank you for your order! We're excited to get your fresh, organic products to you.</p>
                                
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                                    <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Order Number</p>
                                    <p style="margin: 5px 0; color: #374151; font-size: 24px; font-weight: bold; font-family: monospace;">#${parentOrder._id.toString().slice(-8).toUpperCase()}</p>
                                    <p style="margin: 15px 0 5px; color: #6b7280; font-size: 14px;">Total Amount</p>
                                    <p style="margin: 5px 0; color: #2d6a4f; font-size: 28px; font-weight: bold;">Rs. ${totalAmount.toLocaleString()}</p>
                                </div>
                                
                                <div style="margin: 20px 0;">
                                    <h4 style="color: #374151;">Order Items:</h4>
                                    <ul style="list-style: none; padding: 0; background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                                        ${allItems.map(item => `
                                            <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                                                <span style="color: #374151;">• ${item.name} <strong>x${item.quantity}</strong></span>
                                                <span style="color: #2d6a4f; font-weight: bold;">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                                
                                <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h4 style="color: #374151; margin-top: 0;">Delivery Information</h4>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Shipping Address:</strong></p>
                                    <p style="margin: 5px 0; color: #374151;">${shippingAddress.street}<br/>${shippingAddress.city}, ${shippingAddress.postalCode}<br/>${shippingAddress.country}</p>
                                    <p style="margin: 15px 0 5px; color: #6b7280;"><strong>Contact:</strong> ${phoneNumber}</p>
                                    <p style="margin: 15px 0 5px; color: #6b7280;"><strong>Estimated Delivery:</strong> <span style="color: #2d6a4f; font-weight: bold;">1-2 days</span></p>
                                </div>
                                
                                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
                                    <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>📦 Payment:</strong> Cash on Delivery (COD)</p>
                                </div>
                                
                                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Need help? Contact us at <a href="mailto:goorganic.co.pk@gmail.com" style="color: #2d6a4f;">goorganic.co.pk@gmail.com</a></p>
                                <p style="font-size: 14px; color: #6b7280; text-align: center;">Thank you for choosing GOorganic! 🌱</p>
                            </div>
                        </div>
                    `
                });
            }
        } catch (emailError) {
            console.error('Failed to send order confirmation to customer:', emailError);
        }

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

// Get order by ID with sub-orders
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('customer', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to view this order
        const isAdmin = req.user.roles && req.user.roles.includes('admin');
        const isOrderOwner = order.customer._id.toString() === req.user._id.toString();

        if (!isOrderOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        // Get all sub-orders for this order
        const subOrders = await SubOrder.find({ order: id }).populate('vendor', 'name email businessName');

        res.status(200).json({ order, subOrders });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};