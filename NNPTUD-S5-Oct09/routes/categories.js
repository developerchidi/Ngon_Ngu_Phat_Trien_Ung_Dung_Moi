var express = require('express');
var router = express.Router();
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');
let categories = require('../schemas/categories');

// GET /categories - View categories (USER, MOD, ADMIN)
router.get('/', Authentication, Authorization('USER', 'MOD', 'ADMIN'), async function(req, res, next) {
  try {
    const categoryList = await categories.find({ isDeleted: false });
    Response(res, 200, true, categoryList);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// GET /categories/:id - View category by ID (USER, MOD, ADMIN)
router.get('/:id', Authentication, Authorization('USER', 'MOD', 'ADMIN'), async function(req, res, next) {
  try {
    const category = await categories.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) {
      Response(res, 404, false, 'Category not found');
      return;
    }
    Response(res, 200, true, category);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// POST /categories - Create category (MOD, ADMIN)
router.post('/', Authentication, Authorization('MOD', 'ADMIN'), async function(req, res, next) {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      Response(res, 400, false, 'Category name is required');
      return;
    }

    const newCategory = new categories({
      name,
      description: description || ''
    });

    const savedCategory = await newCategory.save();
    Response(res, 201, true, savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      Response(res, 400, false, 'Category name already exists');
    } else {
      Response(res, 500, false, error.message);
    }
  }
});

// PUT /categories/:id - Update category (MOD, ADMIN)
router.put('/:id', Authentication, Authorization('MOD', 'ADMIN'), async function(req, res, next) {
  try {
    const { name, description } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updatedCategory = await categories.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      Response(res, 404, false, 'Category not found');
      return;
    }

    Response(res, 200, true, updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      Response(res, 400, false, 'Category name already exists');
    } else {
      Response(res, 500, false, error.message);
    }
  }
});

// DELETE /categories/:id - Delete category (ADMIN only)
router.delete('/:id', Authentication, Authorization('ADMIN'), async function(req, res, next) {
  try {
    const deletedCategory = await categories.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedCategory) {
      Response(res, 404, false, 'Category not found');
      return;
    }

    Response(res, 200, true, { message: 'Category deleted successfully' });
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;
