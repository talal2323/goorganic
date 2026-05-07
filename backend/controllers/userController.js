import User from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import Token from '../models/tokenModel.js';
import jwt from 'jsonwebtoken';
import Product from '../models/productModel.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { createNotification } from './notificationController.js';

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
                subject: '🔐 Your New GOorganic Verification Code',
                message: `Welcome back! Your new verification code is: ${otp}\nThis code will expire in 15 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d6a4f; margin-top: 0;">🔐 New Verification Code</h2>
                            <p style="font-size: 16px; color: #374151;">Welcome back!</p>
                            <p style="font-size: 16px; color: #374151;">Your new verification code is:</p>
                            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                                <h1 style="color: #065f46; margin: 0; font-size: 36px; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">This code will expire in <strong>15 minutes</strong>.</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Thank you,<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
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
                subject: '🌱 Verify Your GOorganic Account',
                message: `Welcome to GOorganic! Your verification code is: ${otp}\nThis code will expire in 15 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d6a4f; margin-top: 0;">🌱 Welcome to GOorganic!</h2>
                            <p style="font-size: 16px; color: #374151;">Thank you for joining us! We're excited to have you.</p>
                            <p style="font-size: 16px; color: #374151;">To complete your registration, please verify your email with this code:</p>
                            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                                <h1 style="color: #065f46; margin: 0; font-size: 36px; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">This code will expire in <strong>15 minutes</strong>.</p>
                            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                                <p style="margin: 0; color: #1e40af; font-size: 14px;">💡 <strong>Tip:</strong> Enter this code in the verification page to get started with fresh, organic products!</p>
                            </div>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Welcome to a healthier lifestyle!<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
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
            accessToken,
            vendorStatus: user.vendorStatus || null,
            rejectionReason: user.vendorStatus === 'Rejected' ? user.rejectionReason : null
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
            // Check if account is deleted
            if (user.isDeleted) {
                return res.status(403).json({
                    message: 'This account has been deleted. Please contact goorganic.co.pk@gmail.com or register with a new email address.',
                    accountDeleted: true
                });
            }

            // Check if account is suspended
            if (user.isSuspended) {
                return res.status(403).json({
                    message: 'Your account has been suspended. Please contact support for more information.',
                    isSuspended: true,
                    suspensionReason: user.suspensionReason,
                    suspendedAt: user.suspendedAt
                });
            }

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
                vendorStatus: user.vendorStatus || null,
                rejectionReason: user.vendorStatus === 'Rejected' ? user.rejectionReason : null,
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

            // Note: Addresses are now managed via /users/profile/addresses endpoints
            // See addressController.js for address CRUD operations

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

// SOFT DELETE: Request account deletion (user initiated)
export const requestAccountDeletion = async (req, res) => {
    try {
        const { reason } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isDeleted) {
            return res.status(400).json({
                message: 'Account already deleted'
            });
        }

        if (user.deletionRequested) {
            return res.status(400).json({
                message: 'Deletion request already submitted and pending admin review'
            });
        }

        // Flag for deletion request
        user.deletionRequested = true;
        user.deletionRequestDate = Date.now();
        user.deletionReason = reason || 'No reason provided';
        await user.save({ validateBeforeSave: false });

        // Send email notification to admins
        try {
            const admins = await User.find({ roles: 'admin' });

            // Create in-app notifications for all admins
            for (const admin of admins) {
                await createNotification({
                    userId: admin._id,
                    type: 'system',
                    title: 'New Deletion Request',
                    message: `${user.name} (${user.roles.join(', ')}) requested account deletion`,
                    link: '/admin/deletion-requests',
                    metadata: { requestedBy: user.name, userEmail: user.email, userRole: user.roles.join(', ') }
                });
            }

            // Send emails
            for (const admin of admins) {
                await sendEmail({
                    email: admin.email,
                    subject: '🚨 New Account Deletion Request - GOorganic Admin',
                    message: `Dear Admin,\n\nA user has requested account deletion:\n\nUser Details:\n- Name: ${user.name}\n- Email: ${user.email}\n- Role: ${user.roles.join(', ')}\n- Request Date: ${new Date(user.deletionRequestDate).toLocaleString()}\n\nReason for Deletion:\n${user.deletionReason}\n\nPlease review this request in the admin dashboard and take appropriate action.\n\nBest regards,\nGOorganic System`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h2 style="color: #dc2626; margin-top: 0;">🚨 New Account Deletion Request</h2>
                                <p style="font-size: 16px; color: #374151;">Dear Admin,</p>
                                <p style="font-size: 16px; color: #374151;">A user has requested account deletion:</p>
                                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                                    <h4 style="color: #991b1b; margin-top: 0;">User Details:</h4>
                                    <p style="margin: 5px 0; color: #374151;"><strong>Name:</strong> ${user.name}</p>
                                    <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${user.email}</p>
                                    <p style="margin: 5px 0; color: #374151;"><strong>Role:</strong> ${user.roles.join(', ')}</p>
                                    <p style="margin: 5px 0; color: #374151;"><strong>Request Date:</strong> ${new Date(user.deletionRequestDate).toLocaleString()}</p>
                                </div>
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h4 style="color: #374151; margin-top: 0;">Reason for Deletion:</h4>
                                    <p style="margin: 0; color: #6b7280;">${user.deletionReason}</p>
                                </div>
                                <p style="font-size: 14px; color: #6b7280;">Please review this request in the admin dashboard and take appropriate action.</p>
                                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Best regards,<br/>GOorganic System</p>
                            </div>
                        </div>
                    `
                });
            }
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError);
            // Don't fail the request if email fails
        }

        res.status(200).json({
            message: 'Account deletion request submitted successfully. An admin will review your request. You will be notified via email once processed.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//     Change user password

export const changeUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


//     Forgot password -  Send reset token

export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a reset link has been sent.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
        const message = `Forgot your password? Please go to this URL to reset it: \n\n ${resetURL} \n\nThis link is valid for 10 minutes. If you didn't request this, please ignore this email.`;

        await sendEmail({
            email: user.email,
            subject: '🔐 Password Reset Request - GOorganic',
            message,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #2d6a4f; margin-top: 0;">🔐 Password Reset Request</h2>
                        <p style="font-size: 16px; color: #374151;">We received a request to reset your password.</p>
                        <p style="font-size: 16px; color: #374151;">Click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetURL}" style="background-color: #2d6a4f; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
                        <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all;">
                            <code style="color: #374151; font-size: 12px;">${resetURL}</code>
                        </div>
                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">⚠️ This link will expire in <strong>10 minutes</strong>.</p>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                        <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Stay secure,<br/>GOorganic Team 🌱</p>
                    </div>
                </div>
            `
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
            .select('_id shopName shopDescription averageRating reviewCount avatar shopAddress.city name vendorStatus')
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
            .select('name email phoneNumber shopName shopDescription avatar shopAddress shopImages certifications businessCategory productCategories averageRating reviewCount subscription createdAt roles vendorStatus');

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