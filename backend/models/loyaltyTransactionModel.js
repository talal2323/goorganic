import mongoose from 'mongoose';

const loyaltyTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    points: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['earned', 'redeemed'],
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
}, { timestamps: true });

export default mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
