import BoxSubscription from '../models/boxSubscriptionModel.js';
import User from '../models/userModel.js';

const pickShippingAddress = async ({ userId, addressId, shippingAddress }) => {
    if (addressId) {
        const user = await User.findById(userId).select('savedAddresses');
        const match = user?.savedAddresses?.find((a) => a._id.toString() === addressId.toString());
        if (!match) return null;

        return {
            address: match.address,
            city: match.city,
            postalCode: match.postalCode,
            country: match.country || 'Pakistan',
        };
    }

    if (!shippingAddress) return null;

    const { address, city, postalCode, country } = shippingAddress;
    if (!address || !city || !postalCode) return null;

    return {
        address,
        city,
        postalCode,
        country: country || 'Pakistan',
    };
};

// Customer: list my subscriptions
export const getMyBoxSubscriptions = async (req, res) => {
    try {
        const subscriptions = await BoxSubscription.find({ customer: req.user._id })
            .populate({
                path: 'box',
                select: 'title description price frequency isActive',
                populate: { path: 'vendor', select: 'name shopName' },
            })
            .sort({ createdAt: -1 });

        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Customer: cancel
export const cancelBoxSubscription = async (req, res) => {
    try {
        const subscription = await BoxSubscription.findOne({
            _id: req.params.id,
            customer: req.user._id,
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found.' });
        }

        if (subscription.status === 'cancelled') {
            return res.status(200).json(subscription);
        }

        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        await subscription.save();

        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Customer: update address
export const updateBoxSubscriptionAddress = async (req, res) => {
    try {
        const { addressId, shippingAddress } = req.body;

        const subscription = await BoxSubscription.findOne({
            _id: req.params.id,
            customer: req.user._id,
            status: 'active',
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Active subscription not found.' });
        }

        const resolvedAddress = await pickShippingAddress({
            userId: req.user._id,
            addressId,
            shippingAddress,
        });

        if (!resolvedAddress) {
            return res.status(400).json({ message: 'A valid delivery address is required.' });
        }

        subscription.shippingAddress = resolvedAddress;
        await subscription.save();

        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
