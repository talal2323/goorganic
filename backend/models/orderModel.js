import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [{
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  paymentInfo: {
    method: { type: String, enum: ['Cash on Delivery'], default: 'Cash on Delivery' },
    status: { type: String, default: 'Pending' },
  },
  totalPrice: { type: Number, required: true, default: 0.0 },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing',
  },
  deliveredAt: Date,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);