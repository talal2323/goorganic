import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['free', 'paid'],
    },
    price: {
        type: Number,
        required: true,
    },
    productLimit: {
        type: Number,
        required: true,
    },
    features: [{
        type: String,
    }],
}, { timestamps: true });

export const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);