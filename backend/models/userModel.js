// models/userModel.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    // --- Common Fields (All Roles) ---
    name: { type: String, required: true },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        select: false,
        validate: {
            validator: function (value) {
                return validator.isStrongPassword(value, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                });
            },
            message: 'Password must be strong: min 8 chars, with uppercase, lowercase, and a number.',
        },
    },
    isEmailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
    avatar: { public_id: String, url: String },
    
    // ✅ KEPT YOUR EXISTING phoneNumber FIELD (IT'S PERFECT)
    phoneNumber: { type: String, required: function () { return this.role === 'vendor'; } },

    // ✅ ADDED shippingAddress for customers
    shippingAddress: {
        street: String,
        city: String,
        postalCode: String,
        country: String,
    },

    // ✅ ADDED Fields for Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // ✅ ADDED Fields for Email OTP 2FA
    emailOtp: String,
    emailOtpExpires: Date,
    isEmailTwoFactorEnabled: { type: Boolean, default: false },


    // --- Vendor-Specific Fields (Unchanged) ---
    shopName: { type: String, required: function () { return this.role === 'vendor'; } },
    shopDescription: { type: String, required: function () { return this.role === 'vendor'; } },
    businessCategory: { type: String, enum: ['Farmer', 'Retailer', 'Distributor'], required: function () { return this.role === 'vendor'; } },
    productCategories: [{ type: String, required: function () { return this.role === 'vendor'; } }],
    shopAddress: {
        city: { type: String, required: function () { return this.role === 'vendor'; } },
        address: { type: String, required: function () { return this.role === 'vendor'; } },
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

    // --- Customer-Specific Fields (Unchanged) ---
    loyaltyPoints: { type: Number, default: 0 },

}, { timestamps: true });

// --- Password Hashing Hook (Unchanged) ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ✅ ADDED Method to Create Password Reset Token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

    return resetToken; // Return plain token to be emailed
};


export default mongoose.model('User', userSchema);