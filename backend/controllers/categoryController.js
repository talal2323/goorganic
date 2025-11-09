import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

//  Create a new category
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const category = await Category.create({ name });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Category already exists.' });
    }
};

//   Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//   Update a category
export const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//    Delete a category

export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const productsInCategory = await Product.countDocuments({ category: req.params.id });
        if (productsInCategory > 0) {
            return res.status(400).json({ message: 'Cannot delete. Category is currently in use by products.' });
        }
        
        await category.deleteOne();
        res.status(200).json({ message: 'Category deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};