import AddressModel from "../models/Address.js";

class AddressController {
    // Add Address
    static addAddress = async (req, res) => {
        try {
            const userId = req.user.userId;
            const address = new AddressModel({
                ...req.body,
                user: userId
            });

            // If this is the first address, make it default
            const addressCount = await AddressModel.countDocuments({
                user: userId
            });

            if (addressCount === 0) {
                address.isDefault = true;
            }

            await address.save();

            res.status(201).json({
                success: true,
                message: "Address added successfully",
                address
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    // Get All Addresses
    static getAddresses = async (req, res) => {
        try {
            const userId = req.user.userId;
            const addresses = await AddressModel.find({
                user: userId
            }).sort({
                isDefault: -1,
                createdAt: -1
            });

            res.status(200).json({
                success: true,
                count: addresses.length,
                addresses
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    // Update Address
    static updateAddress = async (req, res) => {
        try {
            const userId = req.user.userId;
            const address = await AddressModel.findOneAndUpdate(
                {
                    _id: req.params.id,
                    user: userId
                },

                req.body,
                {
                    new: true
                }
            );

            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Address updated successfully",
                address
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    // Delete Address
    static deleteAddress = async (req, res) => {
        try {
            const userId = req.user.userId;
            const address = await AddressModel.findOneAndDelete({
                _id: req.params.id,
                user: userId
            });

            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });
            }

            // If deleted address was default, make another one default
            if (address.isDefault) {
                const nextAddress = await AddressModel.findOne({
                    user: userId
                });

                if (nextAddress) {
                    nextAddress.isDefault = true;
                    await nextAddress.save();
                }
            }

            res.status(200).json({
                success: true,
                message: "Address deleted successfully"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    // Set Default Address
    static setDefaultAddress = async (req, res) => {
        try {
            const userId = req.user.userId;

            // Remove previous default
            await AddressModel.updateMany(
                {
                    user: userId
                },

                {
                    isDefault: false
                }
            );

            // Set new default
            const address = await AddressModel.findOneAndUpdate(
                {
                    _id: req.params.id,
                    user: userId
                },

                {
                    isDefault: true
                },

                {
                    new: true
                }

            );


            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Default address updated",
                address
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
}

export default AddressController;