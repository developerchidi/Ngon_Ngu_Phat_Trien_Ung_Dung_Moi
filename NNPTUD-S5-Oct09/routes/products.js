var express = require('express');
var router = express.Router();
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');
let products = require('../schemas/products');
let categories = require('../schemas/categories');

// GET /products - View products (USER, MOD, ADMIN)
router.get('/', Authentication, Authorization('USER', 'MOD', 'ADMIN'), async function(req, res, next) {
  try {
    const { category, search } = req.query;
    let filter = { isDeleted: false };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const productList = await products.find(filter).populate('category', 'name description');
    Response(res, 200, true, productList);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// GET /products/:id - View product by ID (USER, MOD, ADMIN)
router.get('/:id', Authentication, Authorization('USER', 'MOD', 'ADMIN'), async function(req, res, next) {
  try {
    const product = await products.findOne({ _id: req.params.id, isDeleted: false }).populate('category', 'name description');
    if (!product) {
      Response(res, 404, false, 'Product not found');
      return;
    }
    Response(res, 200, true, product);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// POST /products - Create product (MOD, ADMIN)
router.post('/', Authentication, Authorization('MOD', 'ADMIN'), async function(req, res, next) {
  try {
    const { name, description, price, stock, imageUrl, category } = req.body;
    
    if (!name || !price || !category) {
      Response(res, 400, false, 'Name, price, and category are required');
      return;
    }

    // Check if category exists
    const categoryExists = await categories.findOne({ _id: category, isDeleted: false });
    if (!categoryExists) {
      Response(res, 400, false, 'Category not found');
      return;
    }

    const newProduct = new products({
      name,
      description: description || '',
      price,
      stock: stock || 0,
      imageUrl: imageUrl || '',
      category
    });

    const savedProduct = await newProduct.save();
    const populatedProduct = await products.findById(savedProduct._id).populate('category', 'name description');
    Response(res, 201, true, populatedProduct);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// PUT /products/:id - Update product (MOD, ADMIN)
router.put('/:id', Authentication, Authorization('MOD', 'ADMIN'), async function(req, res, next) {
  try {
    const { name, description, price, stock, imageUrl, category } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category) {
      // Check if category exists
      const categoryExists = await categories.findOne({ _id: category, isDeleted: false });
      if (!categoryExists) {
        Response(res, 400, false, 'Category not found');
        return;
      }
      updateData.category = category;
    }

    const updatedProduct = await products.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name description');

    if (!updatedProduct) {
      Response(res, 404, false, 'Product not found');
      return;
    }

    Response(res, 200, true, updatedProduct);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// DELETE /products/:id - Delete product (ADMIN only)
router.delete('/:id', Authentication, Authorization('ADMIN'), async function(req, res, next) {
  try {
    const deletedProduct = await products.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedProduct) {
      Response(res, 404, false, 'Product not found');
      return;
    }

    Response(res, 200, true, { message: 'Product deleted successfully' });
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;
