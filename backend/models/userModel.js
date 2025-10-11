import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // --- Common Fields (All Roles) ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  avatar: { public_id: String, url: String },

  // --- Vendor-Specific Fields ---
  shopName: { type: String, required: function() { return this.role === 'vendor'; } },
  shopDescription: { type: String, required: function() { return this.role === 'vendor'; } },
  phoneNumber: { type: String, required: function() { return this.role === 'vendor'; } },
  businessCategory: { type: String, enum: ['Farmer', 'Retailer', 'Distributor'], required: function() { return this.role === 'vendor'; } },
  productCategories: [{ type: String, required: function() { return this.role === 'vendor'; } }],
  shopAddress: {
    city: { type: String, required: function() { return this.role === 'vendor'; } },
    address: { type: String, required: function() { return this.role === 'vendor'; } },
  },
  certifications: [{ public_id: String, url: String, name: String }],
  cnic: { public_id: String, url: String },
  isVerified: { type: Boolean, default: false },
  subscription: {
    plan: { type: String, enum: ['free', 'paid'], default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
    endDate: Date,
  },
  averageRating: { type: Number, default: 0 },

  // --- Customer-Specific Fields ---
  loyaltyPoints: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.model('User', userSchema);