import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true }
    }
  ],

  status: {
    type: String,
    enum: ['Active', 'Unlisted'],
    default: 'Active',
  },

  unlistReason: { type: String }, // Reason why product was unlisted by admin

  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.path('images').validate(function (value) {
  return value.length > 0;
}, 'Please upload at least one product image.');

export default mongoose.model('Product', productSchema);