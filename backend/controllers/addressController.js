import User from '../models/userModel.js';

// Add a new saved address
export const addAddress = async (req, res) => {
    try {
        const { label, address, city, postalCode, country, isDefault } = req.body;

        if (!address || !city || !postalCode) {
            return res.status(400).json({ message: 'Please provide complete address details' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If this is the first address or explicitly set as default, make it default
        const makeDefault = isDefault || user.savedAddresses.length === 0;

        // If making this default, unset other defaults
        if (makeDefault) {
            user.savedAddresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.savedAddresses.push({
            label: label || 'Home',
            address,
            city,
            postalCode,
            country: country || 'Pakistan',
            isDefault: makeDefault
        });

        await user.save();

        res.status(201).json({
            message: 'Address added successfully',
            savedAddresses: user.savedAddresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all saved addresses for the user
export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('savedAddresses');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.savedAddresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a saved address
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { label, address, city, postalCode, country, isDefault } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressIndex = user.savedAddresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            user.savedAddresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // Update the address
        if (label) user.savedAddresses[addressIndex].label = label;
        if (address) user.savedAddresses[addressIndex].address = address;
        if (city) user.savedAddresses[addressIndex].city = city;
        if (postalCode) user.savedAddresses[addressIndex].postalCode = postalCode;
        if (country) user.savedAddresses[addressIndex].country = country;
        if (isDefault !== undefined) user.savedAddresses[addressIndex].isDefault = isDefault;

        await user.save();

        res.status(200).json({
            message: 'Address updated successfully',
            savedAddresses: user.savedAddresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a saved address
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressIndex = user.savedAddresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const wasDefault = user.savedAddresses[addressIndex].isDefault;

        user.savedAddresses.splice(addressIndex, 1);

        // If we deleted the default and there are still addresses, make the first one default
        if (wasDefault && user.savedAddresses.length > 0) {
            user.savedAddresses[0].isDefault = true;
        }

        await user.save();

        res.status(200).json({
            message: 'Address deleted successfully',
            savedAddresses: user.savedAddresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Set an address as default
export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const addressExists = user.savedAddresses.some(
            addr => addr._id.toString() === addressId
        );

        if (!addressExists) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Unset all defaults
        user.savedAddresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });

        await user.save();

        res.status(200).json({
            message: 'Default address updated successfully',
            savedAddresses: user.savedAddresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
