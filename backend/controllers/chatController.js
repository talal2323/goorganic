import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import { filterMessage } from '../utils/messageFilter.js';

const getPrimaryRole = (user) => {
    if (!user || !Array.isArray(user.roles)) {
        return 'customer';
    }
    if (user.roles.includes('admin')) {
        return 'admin';
    }
    if (user.roles.includes('vendor')) {
        return 'vendor';
    }
    return 'customer';
};

const isParticipant = (conversation, userId) => {
    const id = String(userId);
    return String(conversation.customer) === id || String(conversation.vendor) === id;
};

const canStartConversation = async (customerId, vendorId) => {
    const vendor = await User.findById(vendorId).select('roles vendorStatus');

    if (!vendor) {
        return { allowed: false, message: 'Vendor not found.' };
    }

    const isVendor = Array.isArray(vendor.roles) && vendor.roles.includes('vendor');
    if (!isVendor || vendor.vendorStatus !== 'Approved') {
        return { allowed: false, message: 'You can only chat with approved vendors.' };
    }

    return { allowed: true };
};

const buildConversationQuery = (user) => {
    const role = getPrimaryRole(user);

    if (role === 'vendor') {
        return { vendor: user._id };
    }

    if (role === 'customer') {
        return { customer: user._id };
    }

    return {};
};

export const startConversation = async (req, res) => {
    try {
        const role = getPrimaryRole(req.user);
        if (role !== 'customer') {
            return res.status(403).json({ message: 'Only customers can start conversations.' });
        }

        const { vendorId } = req.body;
        if (!vendorId) {
            return res.status(400).json({ message: 'vendorId is required.' });
        }

        const permission = await canStartConversation(req.user._id, vendorId);
        if (!permission.allowed) {
            return res.status(400).json({ message: permission.message });
        }

        const conversation = await Conversation.findOneAndUpdate(
            {
                customer: req.user._id,
                vendor: vendorId
            },
            {
                $setOnInsert: {
                    customer: req.user._id,
                    vendor: vendorId
                }
            },
            {
                new: true,
                upsert: true
            }
        )
            .populate('customer', 'name email')
            .populate('vendor', 'name email shopName');

        return res.status(200).json({ conversation });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getConversations = async (req, res) => {
    try {
        const query = buildConversationQuery(req.user);
        const conversations = await Conversation.find(query)
            .populate('customer', 'name email')
            .populate('vendor', 'name email shopName')
            .sort({ updatedAt: -1 });

        return res.status(200).json({ conversations });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const search = String(req.query.search || '').trim();

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }

        const role = getPrimaryRole(req.user);
        if (role !== 'admin' && !isParticipant(conversation, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to view this conversation.' });
        }

        const filter = { conversation: conversationId };
        if (search) {
            filter.messageText = { $regex: search, $options: 'i' };
        }

        const totalMessages = await Message.countDocuments(filter);
        const messages = await Message.find(filter)
            .populate('sender', 'name email roles')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(200).json({
            messages: messages.reverse(),
            page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const role = getPrimaryRole(req.user);
        if (role !== 'customer' && role !== 'vendor') {
            return res.status(403).json({ message: 'Admin users are read-only in chat.' });
        }

        const { conversationId, messageText } = req.body;

        if (!conversationId || !messageText) {
            return res.status(400).json({ message: 'conversationId and messageText are required.' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }

        if (!isParticipant(conversation, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to send in this conversation.' });
        }

        const filtered = filterMessage(messageText);

        const message = await Message.create({
            conversation: conversationId,
            sender: req.user._id,
            senderRole: role,
            messageText: filtered.sanitizedText,
            status: filtered.isBlocked ? 'filtered' : 'sent',
            filterMetadata: {
                reasons: filtered.reasons,
                matchedTerms: filtered.matchedTerms
            }
        });

        const isCustomerSender = String(conversation.customer) === String(req.user._id);

        conversation.lastMessage = {
            text: filtered.sanitizedText,
            sender: req.user._id,
            status: filtered.isBlocked ? 'filtered' : 'sent',
            createdAt: new Date()
        };

        if (isCustomerSender) {
            conversation.unreadCount.vendor += 1;
        } else {
            conversation.unreadCount.customer += 1;
        }

        await conversation.save();

        const populatedMessage = await Message.findById(message._id).populate('sender', 'name email roles');

        return res.status(201).json({
            message: populatedMessage,
            wasFiltered: filtered.isBlocked,
            filterReasons: filtered.reasons
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const markConversationAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }

        if (!isParticipant(conversation, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        const isCustomer = String(conversation.customer) === String(req.user._id);
        if (isCustomer) {
            conversation.unreadCount.customer = 0;
        } else {
            conversation.unreadCount.vendor = 0;
        }

        await conversation.save();

        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: req.user._id },
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        return res.status(200).json({ message: 'Conversation marked as read.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const exportConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const role = getPrimaryRole(req.user);

        const conversation = await Conversation.findById(conversationId)
            .populate('customer', 'name email')
            .populate('vendor', 'name email shopName');

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }

        if (role !== 'admin' && !isParticipant(conversation, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'name email roles')
            .sort({ createdAt: 1 });

        return res.status(200).json({
            conversation,
            messages,
            exportedAt: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getAdminConversations = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

        const total = await Conversation.countDocuments();
        const conversations = await Conversation.find({})
            .populate('customer', 'name email')
            .populate('vendor', 'name email shopName')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(200).json({
            conversations,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getAdminConversationMessages = async (req, res) =>
    getConversationMessages(req, res);

export const getFlaggedMessages = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        const total = await Message.countDocuments({ status: 'filtered' });
        const messages = await Message.find({ status: 'filtered' })
            .populate('conversation', 'customer vendor')
            .populate('sender', 'name email roles')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(200).json({
            messages,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
