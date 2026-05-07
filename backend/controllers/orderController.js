import { Order, SubOrder } from '../models/orderModel.js';
import { Cart } from '../models/cartModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';
import { generateInvoice } from '../utils/generateInvoice.js';

//   Create a new order from the user's cart
export const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shippingAddress, phoneNumber, saveAddress, addressLabel, paymentMethod, paymentIntentId, shippingFee } = req.body;

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            return res.status(400).json({ message: 'Please provide a complete shipping address.' });
        }
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Please provide a phone number for delivery.' });
        }

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty.' });
        }

        let productsTotal = 0;
        const vendorItems = new Map();

        for (const item of cart.items) {

            if (item.product.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${item.product.name}` });
            }

            const price = item.product.price * item.quantity;
            productsTotal += price;

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

        // Calculate total amount including shipping fee
        const shippingFeeAmount = shippingFee || 0;
        const totalAmount = productsTotal + shippingFeeAmount;

        const parentOrder = await Order.create({
            customer: userId,
            totalAmount,
            shippingFee: shippingFeeAmount,
            shippingAddress,
            phoneNumber,
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentMethod === 'Stripe' ? 'Completed' : 'Pending',
            paymentInfo: paymentMethod === 'Stripe' && paymentIntentId ? {
                paymentIntentId: paymentIntentId,
                status: 'paid',
                paidAt: new Date(),
            } : undefined,
        });

        // Generate and save order number
        parentOrder.orderNumber = `ORD-${parentOrder._id.toString().slice(-8).toUpperCase()}`;
        await parentOrder.save();

        for (const [vendorId, items] of vendorItems.entries()) {
            const subTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            await SubOrder.create({
                order: parentOrder._id,
                vendor: vendorId,
                items,
                subTotal,
                orderStatus: 'Pending'
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
                        subject: '🎉 New Order Received - Action Required - GOorganic',
                        message: `Hello ${vendor.shopName || vendor.name},\n\nYou have received a new order that requires your approval!\n\nOrder Details:\n${itemsList}\n\nSubtotal: Rs. ${subTotal.toLocaleString()}\n\nCustomer: ${customer.name}\nPhone: ${phoneNumber}\nShipping Address: ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}\n\nPlease log in to your vendor dashboard to ACCEPT or CANCEL this order.\n\nThank you for being a valued vendor!`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <h2 style="color: #2d6a4f; margin-top: 0;">🎉 New Order Received - Action Required!</h2>
                                    <p style="font-size: 16px; color: #374151;">Hello <strong>${vendor.shopName || vendor.name}</strong>,</p>
                                    <p style="font-size: 16px; color: #374151;">You have received a new order that requires your approval. Please <strong>ACCEPT</strong> or <strong>CANCEL</strong> this order from your dashboard.</p>
                                    
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
                                        <p style="margin: 5px 0; color: #6b7280;"><strong>Shipping Address:</strong><br/>${shippingAddress.address}<br/>${shippingAddress.city}, ${shippingAddress.postalCode}<br/>${shippingAddress.country}</p>
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

        // Save address if requested
        if (saveAddress) {
            const user = await User.findById(userId);

            // Check if this exact address already exists
            const addressExists = user.savedAddresses.some(addr =>
                addr.address === shippingAddress.address &&
                addr.city === shippingAddress.city &&
                addr.postalCode === shippingAddress.postalCode
            );

            if (!addressExists) {
                // If it's the first address, make it default
                const isFirstAddress = user.savedAddresses.length === 0;

                user.savedAddresses.push({
                    label: addressLabel || 'Home',
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    postalCode: shippingAddress.postalCode,
                    country: shippingAddress.country,
                    isDefault: isFirstAddress
                });

                await user.save();
            }
        }

        // Create in-app notifications for customer and admins
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
                    title: 'Order Placed - Pending Vendor Approval',
                    message: `Your order of Rs. ${totalAmount.toLocaleString()} is pending vendor approval. You'll be notified once confirmed.`,
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
            }
        } catch (notificationError) {
            console.error('Failed to send notifications:', notificationError);
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
        const subOrders = await SubOrder.find({ order: id })
            .populate('vendor', 'name email shopName')
            .populate('items.product', '_id name averageRating reviewCount');

        res.status(200).json({ order, subOrders });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Generate and download invoice PDF for an order
export const downloadInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('customer', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to download this invoice
        const isAdmin = req.user.roles && req.user.roles.includes('admin');
        const isOrderOwner = order.customer._id.toString() === req.user._id.toString();
        const isVendor = req.user.roles && req.user.roles.includes('vendor');

        // Check if vendor is part of this order
        let isOrderVendor = false;
        if (isVendor) {
            const subOrders = await SubOrder.find({ order: id, vendor: req.user._id });
            isOrderVendor = subOrders.length > 0;
        }

        if (!isOrderOwner && !isAdmin && !isOrderVendor) {
            return res.status(403).json({ message: 'Not authorized to download this invoice' });
        }

        // Get all sub-orders for this order
        const subOrders = await SubOrder.find({ order: id }).populate('vendor', 'name email shopName');

        // Generate the PDF
        const doc = generateInvoice(order, subOrders);

        // Set response headers for PDF download
        const filename = `GOorganic-Invoice-${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe the PDF to the response
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ message: 'Error generating invoice' });
    }
};