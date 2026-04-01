import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import { filterMessage } from './messageFilter.js';

let io;

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

const isConversationParticipant = (conversation, userId) => {
    const id = String(userId);
    return String(conversation.customer) === id || String(conversation.vendor) === id;
};

const getAuthToken = (socket) => {
    const authToken = socket.handshake.auth?.token;
    if (authToken) {
        return authToken;
    }

    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return null;
};

const emitConversationUpdate = async (conversationId) => {
    const conversation = await Conversation.findById(conversationId)
        .populate('customer', 'name email')
        .populate('vendor', 'name email shopName');

    if (!conversation) {
        return;
    }

    io.to(`user_${conversation.customer._id}`).emit('conversation_updated', conversation);
    io.to(`user_${conversation.vendor._id}`).emit('conversation_updated', conversation);
    io.to('chat_admins').emit('conversation_updated', conversation);
};

const registerHandlers = (socket) => {
    const user = socket.user;
    const role = getPrimaryRole(user);

    socket.join(`user_${user._id}`);

    if (role === 'admin') {
        socket.join('chat_admins');
    }

    socket.on('join_conversation', async ({ conversationId }) => {
        if (!conversationId) {
            socket.emit('chat_error', { message: 'conversationId is required.' });
            return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            socket.emit('chat_error', { message: 'Conversation not found.' });
            return;
        }

        if (role !== 'admin' && !isConversationParticipant(conversation, user._id)) {
            socket.emit('chat_error', { message: 'Not authorized for this conversation.' });
            return;
        }

        socket.join(`conversation_${conversationId}`);
    });

    socket.on('leave_conversation', ({ conversationId }) => {
        if (!conversationId) {
            return;
        }
        socket.leave(`conversation_${conversationId}`);
    });

    socket.on('send_message', async ({ conversationId, messageText }) => {
        try {
            if (role !== 'customer' && role !== 'vendor') {
                socket.emit('chat_error', { message: 'Admin users are read-only in chat.' });
                return;
            }

            if (!conversationId || !messageText) {
                socket.emit('chat_error', { message: 'conversationId and messageText are required.' });
                return;
            }

            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                socket.emit('chat_error', { message: 'Conversation not found.' });
                return;
            }

            if (!isConversationParticipant(conversation, user._id)) {
                socket.emit('chat_error', { message: 'Not authorized for this conversation.' });
                return;
            }

            const filtered = filterMessage(messageText);

            const message = await Message.create({
                conversation: conversationId,
                sender: user._id,
                senderRole: role,
                messageText: filtered.sanitizedText,
                status: filtered.isBlocked ? 'filtered' : 'sent',
                filterMetadata: {
                    reasons: filtered.reasons,
                    matchedTerms: filtered.matchedTerms
                }
            });

            const isCustomerSender = String(conversation.customer) === String(user._id);

            conversation.lastMessage = {
                text: filtered.sanitizedText,
                sender: user._id,
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

            io.to(`conversation_${conversationId}`).emit('message_received', {
                message: populatedMessage,
                wasFiltered: filtered.isBlocked,
                filterReasons: filtered.reasons
            });

            io.to('chat_admins').emit('message_received', {
                message: populatedMessage,
                wasFiltered: filtered.isBlocked,
                filterReasons: filtered.reasons
            });

            await emitConversationUpdate(conversationId);
        } catch (error) {
            socket.emit('chat_error', { message: 'Failed to send message.' });
        }
    });

    socket.on('message_read', async ({ conversationId }) => {
        if (!conversationId) {
            return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !isConversationParticipant(conversation, user._id)) {
            return;
        }

        const isCustomer = String(conversation.customer) === String(user._id);
        if (isCustomer) {
            conversation.unreadCount.customer = 0;
        } else {
            conversation.unreadCount.vendor = 0;
        }
        await conversation.save();

        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: user._id },
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        io.to(`conversation_${conversationId}`).emit('messages_marked_read', {
            conversationId,
            userId: String(user._id)
        });

        await emitConversationUpdate(conversationId);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
        if (!conversationId) {
            return;
        }

        socket.to(`conversation_${conversationId}`).emit('typing', {
            conversationId,
            userId: String(user._id),
            name: user.name,
            isTyping: Boolean(isTyping)
        });
    });
};

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }
    });

    io.of('/').use(async (socket, next) => {
        try {
            const token = getAuthToken(socket);
            if (!token) {
                return next(new Error('Not authorized: missing token'));
            }

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user || user.isSuspended) {
                return next(new Error('Not authorized'));
            }

            socket.user = user;
            return next();
        } catch (error) {
            return next(new Error('Not authorized'));
        }
    });

    io.on('connection', (socket) => {
        registerHandlers(socket);
    });

    return io;
};

export const getSocketInstance = () => io;
