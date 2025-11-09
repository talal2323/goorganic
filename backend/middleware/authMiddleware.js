import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';


const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

//   MIDDLEWARE FOR ADMINS
const admin = (req, res, next) => {
    
    if (req.user && Array.isArray(req.user.roles) && req.user.roles.includes('admin')) {
        next(); 
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

//  MIDDLEWARE FOR VENDORS
const vendor = (req, res, next) => {
    
    if (req.user && Array.isArray(req.user.roles) && req.user.roles.includes('vendor')) {
        next(); 
    } else {
        res.status(403).json({ message: 'Not authorized as a vendor' });
    }
};

const premiumVendor = (req, res, next) => {
    if (req.user && req.user.subscription && req.user.subscription.plan === 'paid') {
        return next(); 
    }
    return res.status(403).json({ message: 'This is a premium feature. Please upgrade your plan to access it.' }); 
};

const isApprovedVendor = (req, res, next) => {
    
    if (Array.isArray(req.user.roles) && req.user.roles.includes('vendor') && req.user.vendorStatus === 'Approved') {
        next(); 
    } else {
        res.status(403).json({ message: 'Access denied. Your account is not approved to perform this action.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && Array.isArray(req.user.roles) && req.user.roles.includes('admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};


export { protect, admin, vendor, premiumVendor, isApprovedVendor, isAdmin };