import razorpay from "../services/razorpayService.js";
import crypto from "crypto";

class PaymentController {
    // Create Razorpay Order
    static createOrder = async (req, res) => {
        try {
            const { amount } = req.body; // Receive the amount from the frontend
            const options = { // Creates an object that Razorpay needs.
                amount: amount * 100, // Convert ₹ to paise
                // Razorpay doesn't accept rupees.
                // It accepts paise.

                currency: "INR", // Currency = Indian Rupees
                receipt: `receipt_${Date.now()}` // This generates a unique receipt ID.
            };

            // It sends the options object to Razorpay.
            const order = await razorpay.orders.create(options);
            // order - contains this response.
            // Important: At this point, no money has been deducted
            // Only an order has been created in Razorpay.

            // Returns a success response.
            res.status(200).json({
                success: true, // Tells frontend: Everything worked.
                order // Sends the Razorpay order details to the frontend. The frontend will use this to complete the payment.
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
                razorpay_order_id, // This is the order ID that Razorpay generated when the order was created.
                razorpay_payment_id, // This is the payment ID that Razorpay generated when the user completed the payment.
                razorpay_signature // This is the signature that Razorpay generated to verify the payment.
            } = req.body;

            // This is the body that we will use to generate our own signature.
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
