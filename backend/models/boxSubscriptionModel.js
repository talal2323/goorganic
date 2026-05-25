import mongoose from 'mongoose';

const shippingAddressSchema = new mongoose.Schema(
    {
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true, default: 'Pakistan' },
    },
    { _id: false }
);

const boxSubscriptionSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        box: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubscriptionBox',
            required: true,
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
        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        paymentMethod: {
            type: String,
            enum: ['COD'],
            default: 'COD',
        },
        status: {
            type: String,
            enum: ['active', 'cancelled'],
            default: 'active',
        },
        nextDeliveryDate: {
            type: Date,
            required: true,
        },
        lastOrderCreatedAt: {
            type: Date,
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

boxSubscriptionSchema.index({ customer: 1, status: 1, createdAt: -1 });
boxSubscriptionSchema.index({ vendor: 1, status: 1, createdAt: -1 });
boxSubscriptionSchema.index({ nextDeliveryDate: 1, status: 1 });

export default mongoose.model('BoxSubscription', boxSubscriptionSchema);
