import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, selectedAddon } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    if (quantity > 50) {
      return res.status(400).json({ message: "Quantity must be no more than 50" });
    }

    // confirm the product actually exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!product.available) {
      return res
        .status(400)
        .json({ message: "Product is currently unavailable" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // first item this user has ever added — create their cart
      cart = await Cart.create({
        user: userId,
        items: [{
          product: productId,
          quantity,
          selectedAddon: selectedAddon ? {
            name: selectedAddon.name,
            price: selectedAddon.price
          } : undefined
        }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) =>
          item.product.toString() === productId &&
          ((!item.selectedAddon && !selectedAddon) ||
           (item.selectedAddon?.name === selectedAddon?.name))
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          selectedAddon: selectedAddon ? {
            name: selectedAddon.name,
            price: selectedAddon.price
          } : undefined
        });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images available",
    );

    res.status(200).json({
      message: "Item added to cart",
      cart: populatedCart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price images available"
    );

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        itemCount: 0,
        subtotal: 0,
        cart: { user: userId, items: [] },
      });
    }

    const subtotal = cart.items.reduce((total, item) => {
      const itemUnitPrice = item.product ? (item.product.price + (item.selectedAddon?.price || 0)) : 0;
      return total + itemUnitPrice * item.quantity;
    }, 0);

    res.status(200).json({
      message: "Cart fetched successfully",
      itemCount: cart.items.length,
      subtotal,
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    if (quantity > 50) {
      return res.status(400).json({ message: "Quantity must be no more than 50" });
    }
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item._id.toString() === itemId,
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images available",
    );

    res.status(200).json({
      message: "Cart item quantity updated",
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemExists = cart.items.some(
      (item) => item._id.toString() === itemId,
    );
    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId,
    );
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images available",
    );

    res.status(200).json({
      message: "Item removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
