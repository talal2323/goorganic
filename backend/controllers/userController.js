import User from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import Token from '../models/tokenModel.js';
import jwt from 'jsonwebtoken';
import Product from '../models/productModel.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

//      Register a new customer

export const registerCustomer = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            if (user.isEmailVerified) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.emailOtp = otp;
            user.emailOtpExpires = Date.now() + 15 * 60 * 1000;

            await user.save({ validateBeforeSave: false });
            await sendEmail({
                email: user.email,
                subject: 'Your New GOorganic Verification Code',
                message: `Welcome back! Your new verification code is: ${otp}\nThis code will expire in 15 minutes.`,
            });
            return res.status(200).json({
                message: 'This email is already registered but not verified. We have sent a new OTP.',
                userId: user._id
            });
        }
        const newUser = await User.create({ name, email, password });

        if (newUser) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            newUser.emailOtp = otp;
            newUser.emailOtpExpires = Date.now() + 15 * 60 * 1000;
            await newUser.save({ validateBeforeSave: false });

            await sendEmail({
                email: newUser.email,
                subject: 'Verify Your GOorganic Account',
                message: `Welcome to GOorganic! Your verification code is: ${otp}\nThis code will expire in 15 minutes.`,
            });

            res.status(201).json({
                message: 'Registration successful! Please check your email for a verification code.',
                userId: newUser._id
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//      Verify user's email with OTP after registration

export const verifyEmail = async (req, res) => {
    try {
        const { otp, userId } = req.body;

        const user = await User.findOne({
            _id: userId,
            emailOtp: otp,
            emailOtpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        user.isEmailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await Token.create({ user: user._id, token: refreshToken });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Email verified successfully! You are now logged in.',
            _id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            accessToken
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during email verification.' });
    }
};


//      Auth user & get token

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isEmailVerified) {
                return res.status(403).json({ message: 'Please verify your email before logging in.' });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            await Token.create({ user: user._id, token: refreshToken });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                accessToken
            });

        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error during login' });
    }
};


//      Get user profile

export const getUserProfile = async (req, res) => {
    res.status(200).json(req.user);
};

//     Update user profile

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

            if (req.body.shippingAddress) {
                user.shippingAddress = { ...user.shippingAddress, ...req.body.shippingAddress };
            }

            if (user.roles && user.roles.includes('vendor')) {
                user.shopName = req.body.shopName || user.shopName;
                user.shopDescription = req.body.shopDescription || user.shopDescription;
                user.businessCategory = req.body.businessCategory || user.businessCategory;
                user.productCategories = req.body.productCategories || user.productCategories;

                if (req.body.shopAddress) {
                    user.shopAddress = { ...user.shopAddress, ...req.body.shopAddress };
                }
                if (req.body.cnic && req.body.cnic.front) {
                    if (user.cnic && user.cnic.front && user.cnic.front.public_id) {
                        await cloudinary.uploader.destroy(user.cnic.front.public_id);
                    }
                    user.cnic.front = {
                        public_id: req.body.cnic.front.public_id,
                        url: req.body.cnic.front.url
                    };
                }
                if (req.body.cnic && req.body.cnic.back) {
                    if (user.cnic && user.cnic.back && user.cnic.back.public_id) {
                        await cloudinary.uploader.destroy(user.cnic.back.public_id);
                    }
                    user.cnic.back = {
                        public_id: req.body.cnic.back.public_id,
                        url: req.body.cnic.back.url
                    };
                }
            }
            if (req.body.avatar) {
                if (user.avatar && user.avatar.public_id) {
                    await cloudinary.uploader.destroy(user.avatar.public_id);
                }
                user.avatar = {
                    public_id: req.body.avatar.public_id,
                    url: req.body.avatar.url
                };
            }

            const updatedUser = await user.save();
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// delete user profile
export const deleteUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.roles.includes('vendor')) {

            const products = await Product.find({ vendor: user._id });

            for (const product of products) {
                for (const image of product.images) {
                    await cloudinary.uploader.destroy(image.public_id);
                }
            }

            await Product.deleteMany({ vendor: user._id });

            if (user.cnic && user.cnic.front) await cloudinary.uploader.destroy(user.cnic.front.public_id);
            if (user.cnic && user.cnic.back) await cloudinary.uploader.destroy(user.cnic.back.public_id);
            if (user.certifications) {
                for (const cert of user.certifications) {
                    await cloudinary.uploader.destroy(cert.public_id);
                }
            }
            if (user.shopImages) {
                for (const image of user.shopImages) {
                    await cloudinary.uploader.destroy(image.public_id);
                }
            }
        }

        if (user.avatar && user.avatar.public_id) {
            await cloudinary.uploader.destroy(user.avatar.public_id);
        }

        await Token.deleteMany({ user: user._id });

        await user.deleteOne();

        res.cookie('refreshToken', '', {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: 'Your account has been permanently deleted.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//     Change user password

export const changeUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//      Get logged-in user's past orders
// @route   GET /api/v1/users/profile/orders
// @access  Private
/* export const  getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching orders' });
    }
}; */

//     Forgot password -  Send reset token

export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a reset link has been sent.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `Forgot your password? Please go to this URL to reset it: \n\n ${resetURL} \n\nThis link is valid for 10 minutes. If you didn't request this, please ignore this email.`;

        await sendEmail({
            email: user.email,
            subject: 'Your GoOrganic Password Reset Link',
            message,
        });

        res.status(200).json({ message: 'If a user with that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('FORGOT PASSWORD ERROR:', error);
        res.status(500).json({ message: 'Error sending the password reset email.' });
    }
};

//     Reset password - Set new password

export const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired.' });
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await Token.create({ user: user._id, token: refreshToken });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Password reset successful. You are now logged in.',
            accessToken
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//     Log a user out

export const logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            await Token.findOneAndDelete({ token: refreshToken });
        }

        res.cookie('refreshToken', '', {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during logout' });
    }
};

//     Get all approved vendors with pagination

export const getAllVendors = async (req, res) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.page) || 1;
        const filter = {
            roles: 'vendor',
            vendorStatus: 'Approved'
        };

        const totalVendors = await User.countDocuments(filter);

        const vendors = await User.find(filter)
            .select('_id shopName shopDescription averageRating avatar shopAddress.city name')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({
            vendors,
            page,
            totalPages: Math.ceil(totalVendors / pageSize)
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


//     Get a single vendor's public profile by ID

export const getVendorById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name shopName shopDescription avatar shopAddress certifications averageRating createdAt roles vendorStatus');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (Array.isArray(user.roles) && user.roles.includes('vendor') && user.vendorStatus === 'Approved') {
            res.status(200).json(user);
        } else {
            return res.status(404).json({ message: 'Vendor not found or is not approved.' });
        }

    } catch (error) {
        console.error("GET VENDOR BY ID ERROR:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//     Get all featured vendors

export const getFeaturedVendors = async (req, res) => {
    try {
        const limit = 8;
        const filter = {
            roles: 'vendor',
            vendorStatus: 'Approved',
            'subscription.plan': 'paid',
            'subscription.status': 'active'
        };

        const vendors = await User.find(filter)
            .limit(limit)
            .select('_id shopName shopDescription avatar shopAddress.city name');

        res.status(200).json(vendors);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const tokenDoc = await Token.findOne({ token: refreshToken });
        if (!tokenDoc) {
            return res.status(403).json({ message: 'Forbidden, token revoked' });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                console.error('REFRESH TOKEN VERIFICATION FAILED:', err.message);
                return res.status(403).json({ message: 'Forbidden, invalid token' });
            }

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            const accessToken = generateAccessToken(user);
            res.json({ accessToken });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};