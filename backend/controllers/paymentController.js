import razorpay from "../services/razorpayService.js";
import crypto from "crypto";

class PaymentController {
    // Create Razorpay Order
    static createOrder = async (req, res) => {
        try {
            const { amount } = req.body;
            const options = {
                amount: amount * 100, // Convert ₹ to paise
                currency: "INR",
                receipt: `receipt_${Date.now()}`
            };

            const order = await razorpay.orders.create(options);

            res.status(200).json({
                success: true,
                order
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    // Verify Razorpay Payment
    static verifyPayment = async (req, res) => {
        try {
            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;

            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature === razorpay_signature) {
                return res.status(200).json({
                    success: true,
                    message: "Payment Verified Successfully"
                });
            }

            return res.status(400).json({
                success: false,
                message: "Invalid Signature"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
}

export default PaymentController;
