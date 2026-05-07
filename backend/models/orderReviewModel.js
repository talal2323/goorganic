import mongoose from 'mongoose';

const orderReviewItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubOrder',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 500,
    },
}, { _id: true });

const orderReviewSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [orderReviewItemSchema],
    overallRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    deliveryRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    status: {
        type: String,
        enum: ['Published', 'Hidden'],
        default: 'Published',
    },
    hiddenReason: {
        type: String,
        trim: true,
        maxlength: 250,
    },
}, { timestamps: true });

orderReviewSchema.index({ order: 1 }, { unique: true });
orderReviewSchema.index({ customer: 1, createdAt: -1 });
orderReviewSchema.index({ 'items.product': 1, status: 1, createdAt: -1 });
orderReviewSchema.index({ 'items.vendor': 1, status: 1, createdAt: -1 });

export default mongoose.model('OrderReview', orderReviewSchema);
