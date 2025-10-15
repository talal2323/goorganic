// controllers/userController.js

import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// ===================================================
// AUTHENTICATION & REGISTRATION
// (Your existing functions are preserved and updated)
// ===================================================

// @desc    Register a new customer & send verification email
// @route   POST /api/v1/users/register-customer
// @access  Public
export const registerCustomer = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        // ✅ CHANGE: Explicitly check if the user exists first.
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create the user document
        const user = await User.create({ name, email, password });

        if (user) {
            // Generate an OTP for email verification
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.emailOtp = otp;
            user.emailOtpExpires = Date.now() + 15 * 60 * 1000; // OTP expires in 15 minutes
            await user.save();

            // Send the verification email
            await sendEmail({
                email: user.email,
                subject: 'Verify Your GOorganic Account',
                message: `Welcome to GOorganic! Your verification code is: ${otp}\nThis code will expire in 15 minutes.`,
            });
            
            // Respond without a token, prompting the user to verify
            res.status(201).json({ 
                message: 'Registration successful! Please check your email for a verification code.',
                userId: user._id // Send userId for the frontend to use in the next step
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// controllers/userController.js

// @desc    Verify user's email with OTP after registration
// @route   POST /api/v1/users/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { otp, userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the OTP is correct and not expired
        if (user.emailOtp === otp && user.emailOtpExpires > Date.now()) {
            // Mark the user's email as verified
            user.isEmailVerified = true;
            user.emailOtp = undefined;
            user.emailOtpExpires = undefined;
            await user.save();

            // OTP is correct, now log the user in by sending a JWT token
            const token = generateToken(user._id);
            res.status(200).json({
                message: 'Email verified successfully! You are now logged in.',
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during email verification.' });
    }
};

// @desc    Register a new vendor
// @route   POST /api/v1/users/register-vendor
// @access  Public
export const registerVendor = async (req, res) => {
    try {
        const {
            name, email, password, phoneNumber, shopName, shopDescription,
            businessCategory, productCategories, shopAddress
        } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = await User.create({
            name, email, password, role: 'vendor', phoneNumber, shopName,
            shopDescription, businessCategory, productCategories, shopAddress,
        });

        if (user) {
            const token = generateToken(user._id);
            res.status(201).json({
                _id: user._id, name: user.name, email: user.email,
                role: user.role, token: token,
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Auth user & send OTP to email if 2FA is enabled
// @route   POST /api/v1/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.isEmailTwoFactorEnabled) {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.emailOtp = otp;
                user.emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
                await user.save();

                await sendEmail({
                    email: user.email,
                    subject: 'Your GOorganic Login Code',
                    message: `Your one-time password is: ${otp}\nIt will expire in 10 minutes.`,
                });

                res.status(200).json({
                    message: 'An OTP has been sent to your email.',
                    twoFactorRequired: true,
                    userId: user._id,
                });
            } else {
                const token = generateToken(user._id);
                res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
            }
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error during login' });
    }
};

// @desc    Verify Email OTP on login
// @route   POST /api/v1/users/login/verify-otp
// @access  Public
export const verifyLoginEmailOtp = async (req, res) => {
    try {
        const { otp, userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailOtp === otp && user.emailOtpExpires > Date.now()) {
            user.emailOtp = undefined;
            user.emailOtpExpires = undefined;
            await user.save();

            const token = generateToken(user._id);
            res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
        } else {
            res.status(401).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error during OTP verification' });
    }
};


// ===================================================
// USER PROFILE MANAGEMENT
// ===================================================

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user profile (name, email, phone, shippingAddress)
// @route   PUT /api/v1/users/profile
// @access  Private
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

            const updatedUser = await user.save();
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Change user password
// @route   PUT /api/v1/users/profile/change-password
// @access  Private
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

// ===================================================
// USER ACTIVITY
// ===================================================

// @desc    Get logged-in user's past orders
// @route   GET /api/v1/users/profile/orders
// @access  Private
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

// ===================================================
// SECURITY FEATURES (2FA & Password Reset)
// ===================================================

// @desc    Toggle 2FA on/off for a user
// @route   POST /api/v1/users/profile/2fa/toggle
// @access  Private
export const toggleTwoFactorAuth = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.isEmailTwoFactorEnabled = !user.isEmailTwoFactorEnabled;
        await user.save();

        const message = user.isEmailTwoFactorEnabled
            ? 'Two-Factor Authentication has been enabled.'
            : 'Two-Factor Authentication has been disabled.';

        res.status(200).json({ message, isEmailTwoFactorEnabled: user.isEmailTwoFactorEnabled });
    } catch (error) {
        res.status(500).json({ message: 'Server error toggling 2FA status' });
    }
};

// @desc    Forgot password - Step 1: Send reset token
// @route   POST /api/v1/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a reset link has been sent.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // IMPORTANT: This URL should point to your FRONTEND page, not the API endpoint
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

// @desc    Reset password - Step 2: Set new password
// @route   PUT /api/v1/users/reset-password/:token
// @access  Public
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

        const token = generateToken(user._id);
        res.status(200).json({ message: 'Password reset successful.', token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Log a user out (clears cookie)
// @route   POST /api/v1/users/logout
// @access  Public
export const logoutUser = (req, res) => {
    // We need a way to create the cookie, so let's assume
    // your generateToken function also sets the cookie.
    // We'll create a new cookie with no value and an immediate expiry.
    res.cookie('jwt', '', { // Use the same name as your login cookie
        httpOnly: true,
        expires: new Date(0), // Set expiration to a past date
    });
    res.status(200).json({ message: 'Logged out successfully' });
};