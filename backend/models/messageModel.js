import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        senderRole: {
            type: String,
            enum: ['customer', 'vendor', 'admin'],
            required: true
        },
        messageText: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1500
        },
        status: {
            type: String,
            enum: ['sent', 'filtered'],
            default: 'sent'
        },
        filterMetadata: {
            reasons: {
                type: [String],
                default: []
            },
            matchedTerms: {
                type: [String],
                default: []
            }
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ messageText: 'text' });

const Message = mongoose.model('Message', messageSchema);

export default Message;
