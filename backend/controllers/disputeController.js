import mongoose from 'mongoose';
import Dispute from '../models/disputeModel.js';
import { Order, SubOrder } from '../models/orderModel.js';
import User from '../models/userModel.js';
import { createNotification } from './notificationController.js';
import LoyaltyTransaction from '../models/loyaltyTransactionModel.js';

const isCustomer = (user) => Array.isArray(user?.roles) && user.roles.includes('customer');
const isVendor = (user) => Array.isArray(user?.roles) && user.roles.includes('vendor');
const isAdmin = (user) => Array.isArray(user?.roles) && user.roles.includes('admin');

export const createDispute = async (req, res) => {
    try {
        if (!isCustomer(req.user)) {
            return res.status(403).json({ message: 'Only customers can raise disputes.' });
        }

        const { orderId } = req.params;
        const { subOrderId, issueType, subject, description, priority, proofImage } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId).populate('customer', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to raise a dispute for this order' });
        }

        let matchedSubOrder = null;
        if (subOrderId) {
            if (!mongoose.Types.ObjectId.isValid(subOrderId)) {
                return res.status(400).json({ message: 'Invalid sub-order ID' });
            }

            matchedSubOrder = await SubOrder.findOne({ _id: subOrderId, order: orderId }).populate('vendor', 'name shopName email');
            if (!matchedSubOrder) {
                return res.status(404).json({ message: 'Sub-order not found for this order' });
            }
        } else {
            matchedSubOrder = await SubOrder.findOne({ order: orderId }).populate('vendor', 'name shopName email');
        }

        if (!matchedSubOrder) {
            return res.status(404).json({ message: 'Unable to determine the vendor for this dispute' });
        }

        if (!issueType || !subject || !description) {
            return res.status(400).json({ message: 'Please provide an issue type, subject, and description.' });
        }

        const existingOpenDispute = await Dispute.findOne({
            order: orderId,
            subOrder: matchedSubOrder._id,
            customer: req.user._id,
            status: { $in: ['Open', 'Under Review'] },
        });

        if (existingOpenDispute) {
            return res.status(400).json({ message: 'You already have an open dispute for this order item.' });
        }

        const dispute = await Dispute.create({
            order: orderId,
            subOrder: matchedSubOrder._id,
            customer: req.user._id,
            vendor: matchedSubOrder.vendor._id,
            issueType,
            subject,
            description,
            priority: priority || 'Medium',
            proofImage,
            status: 'Open',
        });

        await createNotification({
            userId: matchedSubOrder.vendor._id,
            type: 'order',
            title: 'New dispute raised',
            message: `${req.user.name} raised a dispute for order ${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}`,
            link: '/vendor',
            metadata: { disputeId: dispute._id, orderId: order._id },
        });

        const admins = await User.find({ roles: 'admin' }).select('_id');
        for (const admin of admins) {
            await createNotification({
                userId: admin._id,
                type: 'order',
                title: 'Customer dispute received',
                message: `A dispute was raised for order ${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}`,
                link: '/admin/disputes',
                metadata: { disputeId: dispute._id, orderId: order._id },
            });
        }

        const populatedDispute = await Dispute.findById(dispute._id)
            .populate('customer', 'name email')
            .populate('vendor', 'name shopName email')
            .populate('order', 'orderNumber');

        res.status(201).json({ message: 'Dispute raised successfully', dispute: populatedDispute });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getMyDisputes = async (req, res) => {
    try {
        if (!isCustomer(req.user)) {
            return res.status(403).json({ message: 'Only customers can view this endpoint.' });
        }

        const disputes = await Dispute.find({ customer: req.user._id })
            .populate('vendor', 'name shopName')
            .populate('order', 'orderNumber createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json(disputes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getVendorDisputes = async (req, res) => {
    try {
        if (!isVendor(req.user)) {
            return res.status(403).json({ message: 'Only vendors can view this endpoint.' });
        }

        const disputes = await Dispute.find({ vendor: req.user._id })
            .populate('customer', 'name email')
            .populate('order', 'orderNumber createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json(disputes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getAdminDisputes = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({ message: 'Only admins can view this endpoint.' });
        }

        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const disputes = await Dispute.find(filter)
            .populate('customer', 'name email')
            .populate('vendor', 'name shopName email')
            .populate('order', 'orderNumber createdAt')
            .populate('subOrder', 'orderStatus')
            .sort({ createdAt: -1 });

        res.status(200).json(disputes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateDisputeStatus = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({ message: 'Only admins can update disputes.' });
        }

        const { disputeId } = req.params;
        const { status, resolutionNotes, refundPoints } = req.body;

        if (!mongoose.Types.ObjectId.isValid(disputeId)) {
            return res.status(400).json({ message: 'Invalid dispute ID' });
        }

        if (!['Open', 'Under Review', 'Resolved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid dispute status' });
        }

        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        dispute.status = status;
        dispute.resolutionNotes = resolutionNotes || dispute.resolutionNotes || '';
        if (status === 'Resolved' || status === 'Rejected') {
            dispute.resolvedBy = req.user._id;
            dispute.resolvedAt = new Date();
        }

        if (status === 'Resolved' && refundPoints && Number(refundPoints) > 0) {
            const customer = await User.findById(dispute.customer);
            if (customer) {
                customer.loyaltyPoints = (customer.loyaltyPoints || 0) + Number(refundPoints);
                await customer.save();
                
                await LoyaltyTransaction.create({
                    user: customer._id,
                    points: Number(refundPoints),
                    type: 'earned',
                    reason: `Refund for dispute #${dispute._id.toString().slice(-8).toUpperCase()}`,
                    orderId: dispute.order
                });
            }
        }

        await dispute.save();

        const populatedDispute = await Dispute.findById(dispute._id)
            .populate('customer', 'name email')
            .populate('vendor', 'name shopName email')
            .populate('order', 'orderNumber createdAt')
            .populate('subOrder', 'orderStatus');

        res.status(200).json({ message: 'Dispute updated successfully', dispute: populatedDispute });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const addVendorComment = async (req, res) => {
    try {
        if (!isVendor(req.user)) {
            return res.status(403).json({ message: 'Only vendors can add comments to disputes.' });
        }

        const { disputeId } = req.params;
        const { vendorComment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(disputeId)) {
            return res.status(400).json({ message: 'Invalid dispute ID' });
        }

        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        if (dispute.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only comment on disputes assigned to your shop.' });
        }

        if (dispute.status === 'Resolved' || dispute.status === 'Rejected') {
            return res.status(400).json({ message: 'Cannot comment on a closed dispute.' });
        }

        dispute.vendorComment = vendorComment || '';
        dispute.vendorCommentAt = new Date();

        await dispute.save();

        res.status(200).json({ message: 'Comment added successfully', dispute });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};