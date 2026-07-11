import OrderModel from "../models/Order.js";
import CartModel from "../models/Cart.js";
import AddressModel from "../models/Address.js";

class OrderController {
    // Place an Order
    // This controller does everything related to creating an order.
    static placeOrder = async (req, res) => {
        try {
            const userId = req.user.userId; // Gets user ID
            const { addressId, paymentMethod } = req.body; // Gets address ID and payment method from the frontend

            // Find user's cart
            const cart = await CartModel.findOne({ user: userId })
                .populate("items.product");

            if (!cart || cart.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cart is empty"
                });
            }

            // Check address
            const address = await AddressModel.findOne({
                _id: addressId,
                user: userId
            });

            // If the address is not found, return an error response.
            if (!address) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });
            }

            // Prepare order items
            const orderItems = cart.items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                image: item.product.image,
                quantity: item.quantity,
                price: item.product.discountPrice > 0
                    ? item.product.discountPrice
                    : item.product.price
            }));

            // Create order
            const order = new OrderModel({
                user: userId,
                items: orderItems,
                address: address._id,
                totalAmount: cart.totalPrice,
                paymentMethod: paymentMethod || "Cash on Delivery",
                paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending"
            });

            await order.save();

            // Clear cart
            cart.items = [];
            cart.totalPrice = 0;

            await cart.save();

            res.status(201).json({
                success: true,
                message: "Order placed successfully",
                order
            });
        }

        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    // Get My Orders
    static getMyOrders = async (req, res) => {
        try {
            const userId = req.user.userId;
            const orders = await OrderModel.find({
                user: userId
            })
                .populate("address")
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: orders.length,
                orders
            });
        }

        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    // Get Order By ID
    static getOrderById = async (req, res) => {
        try {
            const userId = req.user.userId;
            const order = await OrderModel.findOne({
                _id: req.params.id,
                user: userId

            }).populate("address");

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            res.status(200).json({
                success: true,
                order
            });
        }

        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    // Cancel Order
    static cancelOrder = async (req, res) => {
        try {
            const userId = req.user.userId;
            const order = await OrderModel.findOne({
                _id: req.params.id,
                user: userId
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            if (order.orderStatus === "Delivered") {
                return res.status(400).json({
                    success: false,
                    message: "Delivered order cannot be cancelled"
                });
            }

            order.orderStatus = "Cancelled";

            await order.save();

            res.status(200).json({
                success: true,
                message: "Order cancelled successfully",
                order

            });
        }

        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
    
}

export default OrderController;