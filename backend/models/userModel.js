import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
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
                    minSymbols: 1,
                });
            },
            message: 'Password must be strong: min 8 chars, with uppercase, lowercase, special character and a number.',
        },
    },
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: String,
    emailOtpExpires: Date,
    roles: {
        type: [String],
        enum: ['customer', 'vendor', 'admin'],
        default: ['customer']
    },
    avatar: { public_id: String, url: String },
    phoneNumber: { type: String, required: function () { return Array.isArray(this.roles) && this.roles.includes('vendor'); } },
    shippingAddress: {
        street: String,
        city: String,
        postalCode: String,
        country: String,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    shopName: { type: String, required: function () { return Array.isArray(this.roles) && this.roles.includes('vendor'); } },
    shopDescription: { type: String, required: function () { return Array.isArray(this.roles) && this.roles.includes('vendor'); } },
    businessCategory: { type: String, enum: ['Farmer', 'Retailer', 'Distributor'], required: function () { return Array.isArray(this.roles) && this.roles.includes('vendor'); } },
    productCategories: [{ type: String, required: function () { return Array.isArray(this.roles) && this.roles.includes('vendor'); } }],
    shopAddress: {
        city: { type: String, required: function () { return Array.isArray(this.roles) && this.roles.includes('vendor'); } },
        address: { type: String, required: function () { return Array.isArray(this.roles) && this.roles.includes('vendor'); } },
    },

    shopImages: [{
        public_id: { type: String },
        url: { type: String }
    }],
    certifications: [{ public_id: String, url: String, name: String }],
    cnic: {
        front: {
            public_id: { type: String },
            url: { type: String }
        },
        back: {
            public_id: { type: String },
            url: { type: String }
        }
    },
    vendorStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
        required: function () { return Array.isArray(this.roles) && this.roles.includes('vendor'); }
    },
    rejectionReason: {
        type: String,
        required: function () { return this.vendorStatus === 'Rejected'; }
    },
    subscription: {
        plan: { type: String, enum: ['free', 'paid'], default: 'free' },
        status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
        endDate: Date,
    },
    averageRating: { type: Number, default: 0 },

    loyaltyPoints: { type: Number, default: 0 },

}, { timestamps: true });
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


export default mongoose.model('User', userSchema);