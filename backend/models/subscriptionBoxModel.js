import mongoose from 'mongoose';

const subscriptionBoxSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        frequency: {
            type: String,
            enum: ['weekly', 'monthly'],
            required: true,
        },
        products: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
            ],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: 'Please select at least one product for the subscription box.',
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

subscriptionBoxSchema.index({ vendor: 1, createdAt: -1 });
subscriptionBoxSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model('SubscriptionBox', subscriptionBoxSchema);
