import CartModel from "../models/Cart.js";
import ProductModel from "../models/Product.js";

class CartController {
  // Add to Cart
  static addToCart = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { productId } = req.body;

      // Check if product exists
      const product = await ProductModel.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // Find user's cart
      let cart = await CartModel.findOne({ user: userId });

      // Create cart if it doesn't exist
      if (!cart) {
        cart = new CartModel({
          user: userId,
          items: [],
          totalPrice: 0,
        });
      }

      // Check whether product already exists in cart
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({
          product: productId,
          quantity: 1,
        });
      }

      // Recalculate total price
      let total = 0;

      for (const item of cart.items) {
        const productData = await ProductModel.findById(item.product);

        const price =
          productData.discountPrice > 0
            ? productData.discountPrice
            : productData.price;

        total += price * item.quantity;
      }

      cart.totalPrice = total;

      await cart.save();

      res.status(200).json({
        message: "Product added to cart successfully",
        cart,
      });

    } catch (error) {
      res.status(500).json({
        message: "Error adding product to cart",
        error: error.message,
      });
    }
  };

  // Get all Cart Items
  static getCart = async (req, res) => {
    try {
      const userId = req.user.userId;
      const cart = await CartModel.findOne({
        user: userId,
      }).populate("items.product");

      if (!cart) {
        return res.status(200).json({
          items: [],
          totalPrice: 0,
        });
      }

      res.status(200).json(cart);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching cart",
        error: error.message,
      });
    }
  };

  // Update Cart Quantity
  static updateQuantity = async (req, res) => {
      try {
          const userId = req.user.userId;
          const { productId } = req.params;
          const { quantity } = req.body;
          const cart = await CartModel.findOne({ user: userId });

          if (!cart) {
              return res.status(404).json({
                  message: "Cart not found"
              });
          }

          const item = cart.items.find(
              item => item.product.toString() === productId
          );

          if (!item) {
              return res.status(404).json({
                  message: "Product not found in cart"
              });
          }
          item.quantity = quantity;

          let total = 0;
          for (const cartItem of cart.items) {
              const product = await ProductModel.findById(cartItem.product);
              const price =
                  product.discountPrice > 0
                      ? product.discountPrice
                      : product.price;
              total += price * cartItem.quantity;
          }

          cart.totalPrice = total;
          await cart.save();

          res.status(200).json({
              message: "Quantity Updated",
              cart
          });

      } catch (error) {
          res.status(500).json({
              message: error.message
          });
      }
  }

  // Remove Item from Cart
  static removeItem = async (req, res) => {
      try {
          const userId = req.user.userId;
          const { productId } = req.params;
          const cart = await CartModel.findOne({
              user: userId
          });

          if (!cart) {
              return res.status(404).json({
                  message: "Cart not found"
              });
          }

          cart.items = cart.items.filter(
              item => item.product.toString() !== productId
          );

          let total = 0;
          for (const item of cart.items) {
              const product = await ProductModel.findById(item.product);
              const price =
                  product.discountPrice > 0
                      ? product.discountPrice
                      : product.price;
              total += price * item.quantity;
          }

          cart.totalPrice = total;
          await cart.save();

          res.json({
              message: "Product Removed",
              cart
          });
      } catch (error) {
          res.status(500).json({
              message: error.message
          });
      }
  }

  // Clear Cart
  static clearCart = async (req, res) => {
      try {
          const userId = req.user.userId;
          const cart = await CartModel.findOne({
              user: userId
          });

          if (!cart) {
              return res.status(404).json({
                  message: "Cart not found"
              });
          }

          cart.items = [];
          cart.totalPrice = 0;
          await cart.save();

          res.json({
              message: "Cart Cleared"
          });
      } catch (error) {
          res.status(500).json({
              message: error.message
          });
      }
  }
}

export default CartController;