import { Cart } from '../models/cartModel.js';
import Product from '../models/productModel.js';

//   Get the logged-in user's cart
export const getMyCart = async (req, res) => {
    try {

        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price images stock');
        
        if (!cart || cart.items.length === 0) {
            return res.status(200).json({ items: [] });
        }
        
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


//  Add an item to the cart or update its quantity
export const addItemToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    try {
    
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            cart.items.push({ 
                product: productId, 
                quantity: quantity, 
                vendor: product.vendor
            });
        }
        
        await cart.save();
        const updatedCart = await Cart.findOne({ user: userId })
            .populate('items.product', 'name price images stock');
            
        res.status(200).json(updatedCart);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//  Remove an item from the cart
export const removeItemFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
        
        await cart.save();
        
        const updatedCart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price images stock');

        res.status(200).json(updatedCart || { items: [] });
        
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};