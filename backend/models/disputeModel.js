import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    subOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubOrder',
        default: null,
    },
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
    issueType: {
        type: String,
        enum: ['Damaged item', 'Wrong item', 'Missing item', 'Late delivery', 'Quality issue', 'Other'],
        required: true,
    },
    subject: {
        type: String,
        trim: true,
        maxlength: 120,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1200,
        required: true,
    },
    proofImage: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
    status: {
        type: String,
        enum: ['Open', 'Under Review', 'Resolved', 'Rejected'],
        default: 'Open',
    },
    resolutionNotes: {
        type: String,
        trim: true,
        maxlength: 1200,
        default: '',
    },
    vendorComment: {
        type: String,
        trim: true,
        maxlength: 1200,
        default: '',
    },
    vendorCommentAt: {
        type: Date,
        default: null,
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    resolvedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

disputeSchema.index({ customer: 1, createdAt: -1 });
disputeSchema.index({ vendor: 1, status: 1, createdAt: -1 });
disputeSchema.index({ order: 1, subOrder: 1 }, { unique: true, partialFilterExpression: { subOrder: { $type: 'objectId' } } });

export default mongoose.model('Dispute', disputeSchema);