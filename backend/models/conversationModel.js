import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        lastMessage: {
            text: { type: String, default: '' },
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
            status: { type: String, enum: ['sent', 'filtered'], default: 'sent' },
            createdAt: { type: Date, default: null }
        },
        unreadCount: {
            customer: { type: Number, default: 0 },
            vendor: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

conversationSchema.index({ customer: 1, vendor: 1 }, { unique: true });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
