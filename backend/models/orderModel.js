import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    phoneNumber: {
        type: String, 
        required: true 
    },
    paymentMethod: {
        type: String,
        enum: ['COD'],
        default: 'COD',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
    },
}, { timestamps: true });


// Sub-Order (The Vendor's Individual Order Slip)

const subOrderSchema = new mongoose.Schema({
    order: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    vendor: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{ 
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number,
        image: String
    }],
    subTotal: { 
        type: Number,
        required: true,
    },
    orderStatus: { 
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing',
    },
    deliveredAt: Date,
}, { timestamps: true });


export const Order = mongoose.model('Order', orderSchema);
export const SubOrder = mongoose.model('SubOrder', subOrderSchema);